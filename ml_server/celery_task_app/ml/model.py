# ML model wrapper class used to load pretrained model and serve recommendations

import torch
from torch import nn
from transformers import AutoTokenizer, AutoModel, AdamW
from sentence_transformers import SentenceTransformer, util
from hanspell import spell_checker 
import json
import os
import numpy as np

device = torch.device('cpu')

# Roberta large 모델

class Roberta_largeForClassification(nn.Module):
    def __init__(self, model_name, class_num):
        super(Roberta_largeForClassification, self).__init__()
        self.class_num = class_num
        
        self.roberta = AutoModel.from_pretrained(model_name)
        emb_size = self.roberta.config.hidden_size

        self.dropout = nn.Dropout(p= self.roberta.config.hidden_dropout_prob, inplace=False)
        self.fn = nn.Linear(emb_size, class_num, bias = True)
        
    # outputs value : sequence_output, pooled_output, (hidden_states), (attentions)
    def output(self,input_ids, attention_mask, token_type_ids =None):
        sequence_output, pooler = self.roberta(input_ids= input_ids,attention_mask= attention_mask).values()
        return sequence_output, pooler
        
    def mean_pooling(self, input_ids, attention_mask, token_type_ids =None):
        token_embeddings = self.output(input_ids,attention_mask)[0]
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)  
        
    def forward(self, input_ids, attention_mask, token_type_ids =None):    
        pooler = self.output(input_ids, attention_mask)[1]
        dropout_result = self.dropout(pooler)
        logit = self.fn(dropout_result)
        return logit

# input dataset 만들어주는 클래스

class Roberta_large_Dataset():  
  
  def __init__(self, dataset,  tokenizer):
    self.tokenizer = tokenizer
    self.sentences = [str([i[0]]) for i in dataset]
    self.labels = [np.int32(i[1]) for i in dataset]

  def __len__(self):
    return (len(self.labels))
  
  def __getitem__(self, i):
    text = self.sentences[i]
    y = self.labels[i]

    inputs = self.tokenizer(
        text, 
        return_tensors='pt',
        truncation=True,
        max_length=64,
        padding='max_length',
        add_special_tokens=True
        )
    
    input_ids = inputs['input_ids'][0]
    attention_mask = inputs['attention_mask'][0]

    return input_ids, attention_mask, y


# Cosine similarity
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * (np.linalg.norm(b)))

MODEL_DICT_PATH = os.environ['MODEL_DICT_PATH']
CLASSIFICATION_RESULT_PATH = os.environ['CLASSIFICATION_RESULT_PATH']

class RecModel:
    """ Wrapper for loading and serving pre-trained model"""
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("klue/roberta-large")
        self.model = self._load_model_from_path(MODEL_DICT_PATH)
        self.classification_result = self._load_classification_result_from_path(CLASSIFICATION_RESULT_PATH)
        self.embedder = SentenceTransformer("sentence-transformers/xlm-r-100langs-bert-base-nli-stsb-mean-tokens")

    @staticmethod
    def _load_model_from_path(model_dict_path):
        os.chdir(os.path.dirname(model_dict_path))
        # Model load
        model_name = "klue/roberta-large"
        class_num = 5
        model = Roberta_largeForClassification(model_name, class_num).to(device)
        model.load_state_dict(torch.load(model_dict_path, map_location=torch.device('cpu')))
        return model

    @staticmethod
    def _load_classification_result_from_path(path):
        result = dict()
        with open(path) as f:
            result = json.load(f)
        return result

    def predict(self, sentence):
        data = [sentence, '0']
        dataset_another = [data]
        another_test = Roberta_large_Dataset(dataset_another, self.tokenizer)
        test_dataloader = torch.utils.data.DataLoader(another_test)
        self.model.eval()

        for input_ids_batch, attention_masks_batch, y_batch in test_dataloader:
            y_batch = y_batch.long().to(device)
            logits = self.model(input_ids_batch.to(device), attention_mask=attention_masks_batch.to(device)).cpu().detach().numpy()

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
            
        return s

    def recommend(self, sentence):
        """
        Returns recommendations given a sentence
        """
        sentence_modified =spell_checker.check(sentence) # 맞춤법 검사
        sentence_modified = sentence_modified.checked # 맞춤법이 고쳐진 문장
        user_emotion = self.predict(sentence_modified)  # RoBERTa모델을 이용하여 예측된 user의 감정

        bert_100langs_user_embeddings = self.embedder.encode(sentence_modified, convert_to_tensor=False).tolist() # bert_100langs를 사용한 user의 문장 임베딩

        candidate = []

        for key, values in self.classification_result.items():
            consine_si = cosine_similarity(values[4]['bert_100langs'], bert_100langs_user_embeddings) # bert_100langs 모델을 사용했을 때 무한도전 자막에 대한 임베딩값과 user문장의 임베딩 값의 코사인 유사도

            meme_emotion = values[2]
            emotion_concord = ( meme_emotion == user_emotion )

            candidate.append([consine_si, key, meme_emotion, emotion_concord])

        candidate = sorted(candidate, key=lambda candidate: candidate[0], reverse=True)
        top_20 = candidate[:20]
        
        answer = []
        for i in top_20:
            answer.append({'file_name': i[1], 'emotion': i[2], 'emotion_concord': i[3]})

        return user_emotion, answer