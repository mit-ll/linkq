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

QUESTION_TYPE_ORDER = ['Comparative', 'Yes/No', 'Generic', 'MultiHop', "Intersection"]
PALETTE = {'LinkQ': '#1f78b4', 'GPT-4': '#fdbf6f'}

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
    ax = sns.barplot(df, x='Question Type', y='% Correct', order=['Comparative', 'Yes/No', 'Generic', 'MultiHop', "Intersection"], hue='Algorithm', hue_order=['LinkQ', 'GPT-4'], palette=PALETTE)

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

    sns.boxplot(df, x='Question Type', y='Total Seconds', order=QUESTION_TYPE_ORDER, hue='Algorithm', palette=PALETTE)
    plt.savefig(Path(PLOTS, 'timing_boxplot_by_category.pdf'), bbox_inches='tight', format='pdf')
    plt.close()

def correctness_boxplot_by_category(target_column_name:str,y_axis_label:str,output_name:str,palette:dict):
    df = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=[target_column_name, 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={target_column_name: 'Correctness', 'complexityType': 'Question Type'})
    df = df.replace(to_replace={'multihop': 'MultiHop', 'generic': 'Generic', 'intersection': 'Intersection', 'yesno': 'Yes/No', 'comparative': 'Comparative'})
    
    # Assumes same number of questions per category
    # If so must be int
    num_questions_per_category = len(df) // len(df['Question Type'].unique())
    df[y_axis_label] = 0
    df['Correctness'] = df['Correctness'].apply(lambda x: f'{x}/3')
    print(df)
    df = df.groupby(['Question Type', 'Correctness']).agg(
        {y_axis_label: 'count'})
    df[y_axis_label] = (df[y_axis_label] / num_questions_per_category) * 100
    print
    ax = sns.barplot(df, x='Question Type', y=y_axis_label, order=QUESTION_TYPE_ORDER, hue='Correctness', hue_order=["3/3","2/3","1/3","0/3"], palette=palette)

    for container in ax.containers:
        ax.bar_label(container, fmt=percent_formatter)
    plt.savefig(Path(PLOTS, f'{output_name}.pdf'), bbox_inches='tight', format='pdf')
    plt.close()

def main():
    PLOTS.mkdir(exist_ok=True)
    accuracy_barchart_by_category()
    timing_boxplot_by_category()
    correctness_boxplot_by_category(target_column_name="linkqAnswerCorrect",y_axis_label="LinkQ Correctness",output_name="linkq_correctness",palette={"0/3": '#999999', "1/3": '#c8ddec', "2/3": '#72aad0', "3/3": '#1f78b4'})
    correctness_boxplot_by_category(target_column_name="plainLLMAnswerCorrect",y_axis_label="GPT-4 Correctness",output_name="plainllm_correctness",palette={"0/3": '#999999', "1/3": '#fff4e5', "2/3": '#ffdeb3', "3/3": '#fdbf6f'})
    print("Done creating plots!")


if __name__ == '__main__':
    main()
