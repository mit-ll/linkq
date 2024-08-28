from pathlib import Path

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

sns.set(rc={'figure.dpi': 300, 'savefig.dpi': 300, 'figure.figsize':(8, 6)})

ROOT = Path(__file__).parent
DATA = Path(ROOT / 'raw_data')
PLOTS = Path(ROOT / 'plots')

def get_data():
    df = pd.read_csv(Path(DATA, 'evaluation-results.csv'), usecols=['linkqAnswerCorrect', 'plainLLMAnswerCorrect', 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={'linkqAnswerCorrect': 'LinkQ', 'plainLLMAnswerCorrect': 'GPT', 'complexityType': 'Category', 'category': 'Domain'})
    df = df.replace(to_replace={'multihop': 'MultiHop', 'generic': 'Generic', 'intersection': 'Intersection', 'yesno': 'Yes/No', 'comparative': 'Comparative'})
    return df

def percent_formatter(x):
    return f'{round(x)}%'

def bar_chart_percent_correct_by_category(df):
    num_questions_per_category = len(df) / len(df['Category'].unique())
    df['LinkQ'] = (df['LinkQ'] > 0).astype(int)
    df['GPT'] = (df['GPT'] > 0).astype(int)
    df = pd.melt(df, id_vars=['id', 'Domain', 'Category', 'question'], var_name='Algorithm', value_name='Correct')
    df = df.groupby(['Category', 'Algorithm']).agg({'Correct': 'sum'}).reset_index()
    df['Fraction'] = [f'{v}/{num_questions_per_category}' for v in df['Correct']]
    df['% Correct'] = (df['Correct'] / num_questions_per_category) * 100
    ax = sns.barplot(df, x='Category', y='% Correct', hue='Algorithm', hue_order=['LinkQ', 'GPT'])

    for container in ax.containers:
        ax.bar_label(container, fmt=percent_formatter)
    plt.savefig(Path(PLOTS, 'evaluation_results.pdf'), bbox_inches='tight', format='pdf')


def main():
    PLOTS.mkdir(exist_ok=True)
    df = get_data()
    bar_chart_percent_correct_by_category(df)


if __name__ == '__main__':
    main()
