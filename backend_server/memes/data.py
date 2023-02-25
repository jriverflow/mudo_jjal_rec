import pymysql
import json

def  insertsql_from_json():
    
  conn = pymysql.connect(
    host="localhost",
    port=3306,
    user="meme",
    password="KDTletsgo1!",
    database="meme_db",
    charset="utf8"
  )

  curs = conn.cursor()

  with open('mudo_json.json', encoding="utf-8") as json_file:
    json_data = json.load(json_file)

    sql = "INSERT INTO meme_db.meme (keyword, personName, path, subtitle) \
            VALUES (%s, %s, %s, %s)"
    
    for datum in json_data:
      keyword = datum["keyword"]
      personName = datum["personName"]
      path = datum["path"]
      subtitle = datum["subtitle"]

      curs.execute(sql, (keyword, personName, path, subtitle))
      conn.commit()

    print("record inserted")
  conn.close()

insertsql_from_json()
