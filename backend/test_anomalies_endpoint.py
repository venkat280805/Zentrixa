import requests
import json

def test_anomaly_upload():
    url = "http://localhost:8000/api/upload"
    file_path = r"C:\Users\MSI\.gemini\antigravity\scratch\ai_data_analyst_assistant\backend\anomalous_data.csv"
    
    with open(file_path, 'rb') as f:
        files = {'file': ('anomalous_data.csv', f, 'text/csv')}
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        result = response.json()
        anomalies = result.get("anomalies", [])
        print(f"Detected {len(anomalies)} anomalies.")
        for a in anomalies:
            print(f"- [{a['severity'].upper()}] {a['column']} (Row {a['row_index']}): {a['reason']}")
        
        # Verify specific expected anomalies
        revenue_anomalies = [a for a in anomalies if a['column'] == 'Revenue']
        has_spike = any("spike" in a['reason'].lower() and a['value'] == 5000 for a in revenue_anomalies)
        has_drop = any("drop" in a['reason'].lower() and a['value'] == 100 for a in revenue_anomalies)
        has_zscore = any("atypical" in a['reason'].lower() and a['value'] == 5000 for a in revenue_anomalies)
        
        if has_spike and has_drop and has_zscore:
            print("\nSUCCESS: All expected anomalies detected.")
        else:
            print("\nFAILURE: Missing expected anomalies.")
            print(f"Spike found: {has_spike}")
            print(f"Drop found: {has_drop}")
            print(f"Z-score outlier found: {has_zscore}")
    else:
        print(f"Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_anomaly_upload()
