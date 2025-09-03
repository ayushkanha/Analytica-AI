
import pandas as pd
import numpy as np

# 1. Load the dataset
file_path = r"C:\Users\ayush\AppData\Local\Temp\tmp0p4xpzjp.csv"
df = pd.read_csv(file_path)

print("--- Original Dataset Summary ---")
print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
print("Missing values before cleaning:")
print(df.isnull().sum()[df.isnull().sum() > 0])
print("\n")

# 2. Clean the data appropriately

# Handle missing values in 'Cabin':
# The 'Cabin' column has 687 missing values (over 77% of the data).
# Given the high percentage of missing values, dropping the column is a reasonable approach.
df = df.drop('Cabin', axis=1)

# Handle missing values in 'Age':
# The 'Age' column has 177 missing values.
# Impute missing 'Age' values with the median 'Age' grouped by 'Pclass' and 'Sex',
# as these features often correlate with age and can provide a more accurate imputation.
df['Age'] = df.groupby(['Pclass', 'Sex'])['Age'].transform(lambda x: x.fillna(x.median()))

# If there are still any NaN values in 'Age' (e.g., if a group was entirely NaN, which is unlikely here),
# fall back to the overall median.
if df['Age'].isnull().any():
    df['Age'] = df['Age'].fillna(df['Age'].median())

# Handle missing values in 'Embarked':
# The 'Embarked' column has 2 missing values.
# Impute with the mode (most frequent value).
most_frequent_embarked = df['Embarked'].mode()[0]
df['Embarked'] = df['Embarked'].fillna(most_frequent_embarked)

# Check for duplicates:
# The summary states 0 duplicates, but it's good practice to confirm or include the check.
# No action needed as per the summary, but if there were, we'd use df.drop_duplicates(inplace=True)
initial_duplicates_count = df.duplicated().sum()
if initial_duplicates_count > 0:
    df.drop_duplicates(inplace=True)
    print(f"Removed {initial_duplicates_count} duplicate rows.\n")
else:
    print("No duplicate rows found (confirmed from summary).\n")

# No explicit inconsistent formats or outliers were highlighted that require specific code
# beyond the missing value handling, which uses median imputation for 'Age' (robust to outliers).

# 3. Save the cleaned dataset
output_file_path = "output.csv"
df.to_csv(output_file_path, index=False)

# 4. Print summary stats after cleaning
print("\n--- Cleaned Dataset Summary ---")
print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
print("\nMissing values after cleaning:")
missing_counts_after_cleaning = df.isnull().sum()
print(missing_counts_after_cleaning[missing_counts_after_cleaning > 0])
if missing_counts_after_cleaning.sum() == 0:
    print("No missing values.")

print("\nData types after cleaning:")
print(df.dtypes)
print(f"\nCleaned data saved to {output_file_path}")