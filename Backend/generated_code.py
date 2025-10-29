
import pandas as pd
import numpy as np

# Load the dataset
df = pd.read_csv("C:\\Users\\ayush\\AppData\\Local\\Temp\\tmpefkjgx_o.csv")

# --- Cleaning Steps ---

# 1. Handle missing values:
#  - '5': Impute the single missing value with the median.
#  - '10': Impute missing values with the median.
df['5'].fillna(df['5'].median(), inplace=True)
df['10'].fillna(df['10'].median(), inplace=True)


# 2. Standardize Player names: Remove extra characters and standardize abbreviations
def clean_player_name(name):
    name = name.replace('(Asia/ICC/SL)', '').replace('(AUS/ICC)', '').replace('(ENG)', '').replace('(Asia/IND)', '').strip()
    return name

df['Player'] = df['Player'].apply(clean_player_name)


# 3. Split Span column into Start and End Year
df[['Start_Year', 'End_Year']] = df['Span'].str.split('-', expand=True)
df['Start_Year'] = df['Start_Year'].astype(int)
df['End_Year'] = df['End_Year'].astype(int)
df.drop('Span', axis=1, inplace=True)


# 4. Convert BBI and BBM to numerical representations (wickets)
def wickets_from_bbi(bbi):
    try:
        return int(bbi.split('/')[0])
    except:
        return np.nan  # Handle potential errors

df['BBI_Wickets'] = df['BBI'].apply(wickets_from_bbi)
df['BBM_Wickets'] = df['BBM'].apply(wickets_from_bbi)
df.drop(['BBI', 'BBM'], axis=1, inplace=True)  # Drop original columns


# 5. Outlier handling (Winsorization) for numerical columns.  Specifically,
# winsorize 'Ave', 'Econ', and 'SR' to reduce the impact of extreme outliers
# on the overall data.  This is done by capping values at the 5th and 95th percentiles.
def winsorize(series):
    lower_bound = series.quantile(0.05)
    upper_bound = series.quantile(0.95)
    return series.clip(lower_bound, upper_bound)

df['Ave'] = winsorize(df['Ave'])
df['Econ'] = winsorize(df['Econ'])
df['SR'] = winsorize(df['SR'])


# --- End Cleaning Steps ---

# Save the cleaned dataset
df.to_csv("output.csv", index=False)

# Print summary stats after cleaning
print("Summary Stats After Cleaning:")
print(f"Rows: {df.shape[0]}")
print(f"Columns: {df.shape[1]}")
print("Missing Counts:")
print(df.isnull().sum())
print("Data Types:")
print(df.dtypes)