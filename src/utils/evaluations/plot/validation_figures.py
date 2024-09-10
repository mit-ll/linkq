from pathlib import Path

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

sns.set(rc={'figure.dpi': 300, 'savefig.dpi': 300})

ROOT = Path(__file__).parent
DATA = Path(ROOT / 'raw_data')
PLOTS = Path(ROOT / 'plots')

def get_aggregated_accuracy_data():
    df = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=['linkqAnswerCorrect', 'plainLLMAnswerCorrect', 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={'linkqAnswerCorrect': 'LinkQ', 'plainLLMAnswerCorrect': 'GPT', 'complexityType': 'Category', 'category': 'Domain'})
    df = df.replace(to_replace={'multihop': 'MultiHop', 'generic': 'Generic', 'intersection': 'Intersection', 'yesno': 'Yes/No', 'comparative': 'Comparative'})
    return df

def get_raw_timing_data():
    timing_columns = ['Total Seconds', 'id', 'complexityType', 'category']
    linkq_df = pd.read_csv(Path(DATA, 'linq-evaluation-results.csv'), usecols=timing_columns)
    linkq_df['Algorithm'] = 'LinkQ'
    plainllm_df = pd.read_csv(Path(DATA, 'plainllm-evaluation-results.csv'), usecols=timing_columns)
    plainllm_df['Algorithm'] = 'GPT'
    combined_df = pd.concat([linkq_df, plainllm_df]).reset_index(drop=True)
    combined_df = combined_df.rename(columns={'complexityType': 'Category', 'category': 'Domain'})
    return combined_df.replace(to_replace={'multihop': 'MultiHop', 'generic': 'Generic', 'intersection': 'Intersection', 'yesno': 'Yes/No', 'comparative': 'Comparative'})

def percent_formatter(x):
    return f'{round(x)}%'

def accuracy_barchart_by_category():
    df = get_aggregated_accuracy_data()
    # Assumes same number of questions per category
    # If so must be int
    num_questions_per_category = len(df) // len(df['Category'].unique())
    df['LinkQ'] = (df['LinkQ'] > 0).astype(int)
    df['GPT'] = (df['GPT'] > 0).astype(int)
    df = pd.melt(df, id_vars=['id', 'Domain', 'Category', 'question'], var_name='Algorithm', value_name='Correct')
    df = df.groupby(['Category', 'Algorithm']).agg({'Correct': 'sum'}).reset_index()
    df['Fraction'] = [f'{v}/{num_questions_per_category}' for v in df['Correct']]
    df['% Correct'] = (df['Correct'] / num_questions_per_category) * 100
    ax = sns.barplot(df, x='Category', y='% Correct', hue='Algorithm', hue_order=['LinkQ', 'GPT'])

    for container in ax.containers:
        ax.bar_label(container, fmt=percent_formatter)
    plt.savefig(Path(PLOTS, 'accuracy_barchart_by_category.pdf'), bbox_inches='tight', format='pdf')
    plt.close()

def timing_boxplot_by_category():
    df = get_raw_timing_data()
    sns.boxplot(df, x='Category', y='Total Seconds', hue='Algorithm')
    plt.savefig(Path(PLOTS, 'timing_boxplot_by_category.pdf'), bbox_inches='tight', format='pdf')
    plt.close()

def main():
    PLOTS.mkdir(exist_ok=True)
    accuracy_barchart_by_category()
    timing_boxplot_by_category()


if __name__ == '__main__':
    main()
