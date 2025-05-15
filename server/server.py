from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

df = pd.read_csv('StudentPerformanceFactors.csv')

def get_bin(score):
    try:
        score = float(score)
    except Exception:
        return None
    if 50 <= score <= 65:
        return 1
    elif 65 < score <= 75:
        return 2
    elif 75 < score <= 90:
        return 3
    elif 90 < score <= 100:
        return 4
    else:
        return 1

df['bin_id'] = df['Exam_Score'].apply(get_bin)
df_cleaned = df.dropna()  

@app.route('/data')
def get_data():
    filtered = df_cleaned.copy()

    
    for key, values in request.args.lists():
        values_set = set(values)
        if key == "id":
            
            filtered = filtered[filtered['id'].astype(str).isin(values_set)]
        elif key == "bin_id":
            filtered = filtered[filtered['bin_id'].astype(str).isin(values_set)]
        else:
            if key in filtered.columns:
                filtered = filtered[filtered[key].astype(str).isin(values_set)]

    return jsonify(filtered.to_dict(orient='records'))

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)
