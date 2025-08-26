
import pandas as pd
import numpy as np
import os

# Define the dataset path
file_path = r"C:\Users\ayush\AppData\Local\Temp\tmp8hxsuyi9.csv"

# 1. Load the dataset
df = pd.read_csv(file_path)

# 2. Clean the data appropriately

# Handle Missing Values:
# --- Age Column ---
# 'Age' has 177 missing values. Given it's a numerical column,
# imputation with the median is a robust choice, less sensitive to outliers than the mean.
median_age = df['Age'].median()
df['Age'].fillna(median_age, inplace=True)

# --- Cabin Column ---
# 'Cabin' has a very high number of missing values (687 out of 891, ~77%).
# Imputing with a placeholder like 'U' (for Unknown) is a common strategy
# to retain the column while indicating missingness, rather than dropping it entirely.
df['Cabin'].fillna('U', inplace=True)

# --- Embarked Column ---
# 'Embarked' has 2 missing values. Given it's a categorical column and a small number
# of missing values, imputation with the mode (most frequent value) is appropriate.
mode_embarked = df['Embarked'].mode()[0] # .mode() returns a Series, take the first element
df['Embarked'].fillna(mode_embarked, inplace=True)

# Duplicates:
# The summary states 0 duplicates, so no action is needed for duplicates.

# Inconsistent Formats & Outliers:
# Based on the summary, there are no immediate obvious inconsistent formats
# that require cleaning beyond handling missing values.
# Outlier detection and handling for 'Age' or 'Fare' could be a next step
# for more advanced analysis, but for basic cleaning, addressing missing values
# is the primary focus given the initial summary.

# 3. Save the cleaned dataset as "output.csv" in the same directory
output_directory = os.path.dirname(file_path)
output_file_path = os.path.join(output_directory, "output.csv")
df.to_csv(output_file_path, index=False)

# 4. Print summary stats after cleaning
print("--- Summary Statistics After Cleaning ---")
print(f"Number of rows: {df.shape[0]}")
print(f"Number of columns: {df.shape[1]}")

print("\nMissing values per column:")
print(df.isnull().sum())

print("\nData types per column:")
print(df.dtypes)

print(f"\nCleaned data saved to: {output_file_path}")