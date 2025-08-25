
import pandas as pd
import os

# 1. Loads the dataset
input_path = r"C:\Users\ayush\AppData\Local\Temp\tmplu5mfojg.csv"
df = pd.read_csv(input_path)

# 2. Cleans the data appropriately
# Based on the provided summary:
# - Missing values: The 'missing_counts' dictionary shows 0 missing values for all columns.
# - Duplicates: The 'duplicates' count is 0, indicating no duplicate rows.
# - Inconsistent formats: Data types ('dtypes') appear appropriate for each column (e.g., 'Age' and 'Fare' are float64, IDs and counts are int64, text columns are objects). No obvious inconsistencies are present in the sample data.
# - Outliers: The summary does not provide enough statistical information (like min/max, quartiles) to detect outliers, but the sample data looks reasonable for a Titanic dataset. Without specific thresholds or domain knowledge, no outlier treatment is applied.

# Given that the dataset summary indicates no missing values, no duplicates, and appropriate data types,
# no explicit data cleaning steps (like imputation, dropping duplicates, or type conversions) are required
# based on the information provided. The dataset appears to be remarkably clean already.
# We will proceed by simply creating a copy, as no modifications are needed.
cleaned_df = df.copy()

# 3. Saves the cleaned dataset as "output.csv" in the same directory
output_dir = os.path.dirname(input_path)
output_path = os.path.join(output_dir, "output.csv")
cleaned_df.to_csv(output_path, index=False)

# 4. Prints summary stats after cleaning
print("--- Summary Statistics After Cleaning ---")
print(f"Rows: {cleaned_df.shape[0]}")
print(f"Columns: {cleaned_df.shape[1]}")

print("\nMissing counts per column:")
print(cleaned_df.isnull().sum())

print("\nData types per column:")
print(cleaned_df.dtypes)