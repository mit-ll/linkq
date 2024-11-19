# Copyright (c) 2024 Massachusetts Institute of Technology
# SPDX-License-Identifier: MIT

from pathlib import Path

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

sns.set(rc={'figure.dpi': 300, 'savefig.dpi': 300})

ROOT = Path(__file__).parent
DATA = Path(ROOT.parent / 'data')
PLOTS = Path(ROOT / 'plots')

def percent_formatter(x):
    return f'{round(x)}%'

palette = {'LinkQ': '#1f78b4', 'GPT-4': '#fdbf6f'}

def accuracy_barchart_by_category():
    df = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=['linkqAnswerCorrect', 'plainLLMAnswerCorrect', 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={'linkqAnswerCorrect': 'LinkQ', 'plainLLMAnswerCorrect': 'GPT-4', 'complexityType': 'Question Type'})
    df = df.replace(to_replace={'multihop': 'MultiHop', 'generic': 'Generic', 'intersection': 'Intersection', 'yesno': 'Yes/No', 'comparative': 'Comparative'})
    # Assumes same number of questions per category
    # If so must be int
    num_questions_per_category = len(df) // len(df['Question Type'].unique())
    df['LinkQ'] = (df['LinkQ'] > 0).astype(int)
    df['GPT-4'] = (df['GPT-4'] > 0).astype(int)
    df = pd.melt(df, id_vars=['id', 'category', 'Question Type', 'question'], var_name='Algorithm', value_name='Correct')
    df = df.groupby(['Question Type', 'Algorithm']).agg({'Correct': 'sum'}).sort_values(by='Correct',ascending=False).reset_index()
    df['Fraction'] = [f'{v}/{num_questions_per_category}' for v in df['Correct']]
    df['% Correct'] = (df['Correct'] / num_questions_per_category) * 100
    ax = sns.barplot(df, x='Question Type', y='% Correct', hue='Algorithm', hue_order=['LinkQ', 'GPT-4'], palette=palette)

    for container in ax.containers:
        ax.bar_label(container, fmt=percent_formatter)
    plt.savefig(Path(PLOTS, 'accuracy_barchart_by_category.pdf'), bbox_inches='tight', format='pdf')
    plt.close()

def timing_boxplot_by_category():
    timing_columns = ['Total Seconds', 'id', 'complexityType', 'category']
    linkq_df = pd.read_csv(Path(DATA, 'linkq-evaluation-results.csv'), usecols=timing_columns)
    linkq_df['Algorithm'] = 'LinkQ'
    plainllm_df = pd.read_csv(Path(DATA, 'plainllm-evaluation-results.csv'), usecols=timing_columns)
    plainllm_df['Algorithm'] = 'GPT-4'
    combined_df = pd.concat([linkq_df, plainllm_df]).reset_index(drop=True)
    combined_df = combined_df.rename(columns={'complexityType': 'Question Type'})

    df = combined_df.replace(to_replace={'multihop': 'MultiHop', 'generic': 'Generic', 'intersection': 'Intersection', 'yesno': 'Yes/No', 'comparative': 'Comparative'})

    sns.boxplot(df, x='Question Type', y='Total Seconds', hue='Algorithm', palette=palette)
    plt.savefig(Path(PLOTS, 'timing_boxplot_by_category.pdf'), bbox_inches='tight', format='pdf')
    plt.close()

def correctness_boxplot_by_category(target_column_name:str,y_axis_label:str,output_name:str,palette:dict):
    df = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=[target_column_name, 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={target_column_name: 'Correct', 'complexityType': 'Question Type'})
    df = df.replace(to_replace={'multihop': 'MultiHop', 'generic': 'Generic', 'intersection': 'Intersection', 'yesno': 'Yes/No', 'comparative': 'Comparative'})
    
    # Assumes same number of questions per category
    # If so must be int
    num_questions_per_category = len(df) // len(df['Question Type'].unique())
    df[y_axis_label] = 0
    df = df.groupby(['Question Type', 'Correct']).agg(
        {y_axis_label: 'count'})
    df[y_axis_label] = (df[y_axis_label] / num_questions_per_category) * 100
    ax = sns.barplot(df, x='Question Type', y=y_axis_label, hue='Correct', hue_order=[3,2,1,0], palette=palette)

    for container in ax.containers:
        ax.bar_label(container, fmt=percent_formatter)
    plt.savefig(Path(PLOTS, f'{output_name}.pdf'), bbox_inches='tight', format='pdf')
    plt.close()

def main():
    PLOTS.mkdir(exist_ok=True)
    accuracy_barchart_by_category()
    timing_boxplot_by_category()
    correctness_boxplot_by_category(target_column_name="linkqAnswerCorrect",y_axis_label="LinkQ Correctness",output_name="linkq_correctness",palette={0: '#999999', 1: '#7fa0b6', 2: '#528db4', 3: '#1f78b4'})
    correctness_boxplot_by_category(target_column_name="plainLLMAnswerCorrect",y_axis_label="GPT-4 Correctness",output_name="plainllm_correctness",palette={0: '#999999', 1: '#fff1e0', 2: '#ffd6a1', 3: '#fdbf6f'})
    print("Done creating plots!")


if __name__ == '__main__':
    main()
