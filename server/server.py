from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

df = pd.read_csv('StudentPerformanceFactors.csv')

@app.route('/data')
def get_data():
    # Drop rows with NA values
    df_cleaned = df.dropna()

    # Define binning logic
    def get_bin(score):
        if 50 <= score < 65:
            return 1
        elif 65 <= score < 80:
            return 2
        elif 80 <= score < 90:
            return 3
        elif 90 <= score <= 101:
            return 4
        else:
            return None

    # Add bin_id column
    data_with_bins = df_cleaned.copy()
    if 'Exam_Score' in data_with_bins.columns:
        data_with_bins['bin_id'] = data_with_bins['Exam_Score'].apply(get_bin)
    else:
        return jsonify({'error': 'Score column not found'}), 400

    # Return all rows with bin_id
    return jsonify(data_with_bins.to_dict(orient='records'))

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)