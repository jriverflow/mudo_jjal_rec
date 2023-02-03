# ML model wrapper class used to load pretrained model and serve recommendations

import json
import os
import pandas as pd
import torch
from torch import nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import gluonnlp as nlp
import numpy as np

from kobert.utils import get_tokenizer 
from kobert.pytorch_kobert import get_pytorch_kobert_model

from hanspell import spell_checker 

class BERTDataset(Dataset):
    """
    # 모델에 input 될수 있도록 하는 데이터 변환 과정 
    #  KoBERT 모델의 입력으로 들어갈 수 있는 형태가 되도록 토큰화, 정수 인코딩, 패딩 등을 해야함. 
    """
    def __init__(self, dataset, sent_idx, label_idx, bert_tokenizer, max_len,
                 pad, pair):
        transform = nlp.data.BERTSentenceTransform(
            bert_tokenizer, max_seq_length=max_len, pad=pad, pair=pair)

        self.sentences = [transform([i[sent_idx]]) for i in dataset]
        self.labels = [np.int32(i[label_idx]) for i in dataset]

    def __getitem__(self, i):
        return (self.sentences[i] + (self.labels[i], ))

    def __len__(self):
        return (len(self.labels))

class BERTClassifier(nn.Module):
    """KoBERT"""
    def __init__(self,
                 bert,
                 hidden_size = 768,
                 num_classes=5,
                 dr_rate=None,
                 params=None):
        super(BERTClassifier, self).__init__()
        self.bert = bert
        self.dr_rate = dr_rate
                 
        self.classifier = nn.Linear(hidden_size , num_classes)
        if dr_rate:
            self.dropout = nn.Dropout(p=dr_rate)
    
    def gen_attention_mask(self, token_ids, valid_length):
        attention_mask = torch.zeros_like(token_ids)
        for i, v in enumerate(valid_length):
            attention_mask[i][:v] = 1
        return attention_mask.float()
    

    def embeddings(self, token_ids, valid_length, segment_ids, extract = True):
        attention_mask = self.gen_attention_mask(token_ids, valid_length)
        
        _, pooler = self.bert(input_ids = token_ids, token_type_ids = segment_ids.long(), attention_mask = attention_mask.float().to(token_ids.device))

        if extract:
            return pooler
        else:
            if self.dr_rate:
                out = self.dropout(pooler)
            else:
                out = pooler 

            return out      


    def forward(self, token_ids, valid_length, segment_ids):
        emb = self.embeddings(token_ids, valid_length, segment_ids, False)
        return self.classifier(emb)

# Cosine similarity
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * (np.linalg.norm(b)))

MODEL_PATH = os.environ['MODEL_PATH']
CLASSIFICATION_RESULT_PATH = os.environ['CLASSIFICATION_RESULT_PATH']

class RecModel:
    """ Wrapper for loading and serving pre-trained model"""
    def __init__(self):
        pass
        self.model = self._load_model_from_path(MODEL_PATH)
        self.classification_result = self._load_classification_result_from_path(CLASSIFICATION_RESULT_PATH)

    @staticmethod
    def _load_model_from_path(path):
        model = torch.load(path)
        return model

    @staticmethod
    def _load_classification_result_from_path(path):
        result = json.load(path)
        return result

    def predict(sentence):
        device = torch.device("cuda:0")

        bertmodel, vocab = get_pytorch_kobert_model() 

        # Tokenization
        tokenizer = get_tokenizer()
        tok = nlp.data.BERTSPTokenizer(tokenizer, vocab, lower=False)

        max_len = 64
        batch_size = 64

        data = [sentence, '0']
        dataset_another = [data]

        another_test = BERTDataset(dataset_another, 0, 1, tok, max_len, True, False)
        test_dataloader = torch.utils.data.DataLoader(another_test, batch_size=batch_size, num_workers=4)

        model = BERTClassifier(bertmodel,  dr_rate=0.5).to(device)
        
        model.eval()

        for batch_id, (token_ids, valid_length, segment_ids, label) in enumerate(test_dataloader):
            token_ids = token_ids.long().to(device)
            segment_ids = segment_ids.long().to(device)

            valid_length= valid_length
            label = label.long().to(device)

            logits = model(token_ids, valid_length, segment_ids).cpu().detach().numpy()  # 범주 5개로 된 출력값
        
            embed = model.embeddings(token_ids, valid_length, segment_ids).cpu().detach().numpy().tolist()  # 임베딩값

            s = ''
            if np.argmax(logits) == 0:
                s = "놀람"
            elif np.argmax(logits) == 1:
                s = "분노"
            elif np.argmax(logits) == 2:
                s = "슬픔"
            elif np.argmax(logits) == 3:
                s = "중립"
            elif np.argmax(logits) == 4:
                s = "행복"

            return s,  embed

    def recommend(self, sentence):
        """
        Returns recommendations given a sentence
        """
        sentence_modified =spell_checker.check(sentence) # 맞춤법 검사
        sentence_modified = sentence_modified.checked

        user_emotion,  user_embedding = self.predict(sentence_modified)

        candidate = []
        for key, values in self.classification_result.items():
            if values[2] == user_emotion:
                cosine_si = cosine_similarity(user_embedding[0], values[4][0])
                candidate.append([key,cosine_si])
            else:
                continue    

        candidate = sorted(candidate, key=lambda candidate: candidate[1], reverse=True)
        top_10 = candidate[:10]
        
        answer = []
        for i in top_10:
            answer.append(i[0])
            
        return answer