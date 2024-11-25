# Copyright (c) 2024 Massachusetts Institute of Technology
# SPDX-License-Identifier: MIT

from pathlib import Path

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

sns.set(rc={'figure.dpi': 300, 'savefig.dpi': 300})

ROOT = Path(__file__).parent
DATA = Path(ROOT.parent / 'data')
PLOTS = Path(ROOT / 'plots')

def percent_formatter(x):
    return f'{round(x)}%'

QUESTION_TYPE_ORDER = ['Comparative', 'Yes/No', 'Generic', 'MultiHop', "Intersection"]
PALETTE = {'LinkQ': '#1f78b4', 'GPT-4': '#fdbf6f'}
TO_REPLACE = {'multihop': 'MultiHop', 'generic': 'Generic', 'intersection': 'Intersection', 'yesno': 'Yes/No', 'comparative': 'Comparative'}

def accuracy_barchart_by_category():
    df = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=['linkqAnswerCorrect', 'plainLLMAnswerCorrect', 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={'linkqAnswerCorrect': 'LinkQ', 'plainLLMAnswerCorrect': 'GPT-4', 'complexityType': 'Question Type'})
    df = df.replace(to_replace=TO_REPLACE)
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

    df = combined_df.replace(to_replace=TO_REPLACE)

    sns.boxplot(df, x='Question Type', y='Total Seconds', order=QUESTION_TYPE_ORDER, hue='Algorithm', palette=PALETTE)
    plt.savefig(Path(PLOTS, 'timing_boxplot_by_category.pdf'), bbox_inches='tight', format='pdf')
    plt.close()

def correctness_barchart_by_algorithm(target_column_name:str,y_axis_label:str,output_name:str,palette:dict):
    df = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=[target_column_name, 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={target_column_name: 'Correctness', 'complexityType': 'Question Type'})
    df = df.replace(to_replace=TO_REPLACE)
    
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

linkq_palette = {"LinkQ 0/3": '#999999', "LinkQ 1/3": '#c8ddec', "LinkQ 2/3": '#72aad0', "LinkQ 3/3": '#1f78b4'}
plainllm_palette = {"GPT-4 0/3": '#999999', "GPT-4 1/3": '#fff4e5', "GPT-4 2/3": '#ffdeb3', "GPT-4 3/3": '#fdbf6f'}
tmp_palette = {"LinkQ 0/3": '#999999', "LinkQ 1/3": '#c8ddec', "LinkQ 2/3": '#72aad0', "LinkQ 3/3": '#1f78b4', "GPT-4 0/3": '#999999', "GPT-4 1/3": '#fff4e5', "GPT-4 2/3": '#ffdeb3', "GPT-4 3/3": '#fdbf6f'}
def correctness_barchart():
    df1 = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=['linkqAnswerCorrect', 'complexityType', 'category', 'id', 'question'])
    df1 = df1.rename(columns={'linkqAnswerCorrect': 'Correctness', 'complexityType': 'Question Type'})
    df1 = df1.replace(to_replace=TO_REPLACE)
    num_questions_per_category = len(df1) // len(df1['Question Type'].unique())
    df1 = df1.loc[df1['Correctness'] != 0]
    df1['Correctness'] = df1['Correctness'].apply(lambda x: f'LinkQ {x}/3')
    

    df2 = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=['plainLLMAnswerCorrect', 'complexityType', 'category', 'id', 'question'])
    df2 = df2.rename(columns={'plainLLMAnswerCorrect':'Correctness', 'complexityType': 'Question Type'})
    df2 = df2.replace(to_replace=TO_REPLACE)
    df2 = df2.loc[df2['Correctness'] != 0]
    df2['Correctness'] = df2['Correctness'].apply(lambda x: f'GPT-4 {x}/3')

    df = df1._append(df2, ignore_index=True)
    
    # Assumes same number of questions per category
    # If so must be int
    df['tmp'] = 0
    print(df)
    df = df.groupby(['Question Type', 'Correctness']).agg(
        {'tmp': 'count'}).unstack(fill_value=0).stack().reset_index()
    df['tmp'] = (df['tmp'] / num_questions_per_category) * 100
    print("-----------------------------------------------------------------------------")
    print(df)


    ax = sns.barplot(df, x='Question Type', y="tmp", order=QUESTION_TYPE_ORDER, hue='Correctness', 
                     hue_order=["LinkQ 3/3","GPT-4 3/3","LinkQ 2/3","GPT-4 2/3","LinkQ 1/3","GPT-4 1/3"], 
                     palette=tmp_palette)

    for container in ax.containers:
        ax.bar_label(container, fmt=percent_formatter)
    plt.savefig(Path(PLOTS, f'correctness.pdf'), bbox_inches='tight', format='pdf')
    # plt.show()
    plt.close()

def correctness_stacked_barchart():
    df = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=['linkqAnswerCorrect', 'plainLLMAnswerCorrect', 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={'linkqAnswerCorrect': 'LinkQ', 'plainLLMAnswerCorrect': 'GPT-4', 'complexityType': 'Question Type'})
    df = df.replace(to_replace=TO_REPLACE)

    # custom sort the question types
    df["Question Type"] = pd.Categorical(df["Question Type"], categories=QUESTION_TYPE_ORDER, ordered=True)
    df = df.sort_values("Question Type")

    df['LinkQ'] = df['LinkQ'].apply(lambda x: f'{x}/3')
    df['GPT-4'] = df['GPT-4'].apply(lambda x: f'{x}/3')

    # Assumes same number of questions per category
    # If so must be int
    num_questions_per_category = len(df) // len(df['Question Type'].unique())
    print("num_questions_per_category",num_questions_per_category)


    df = pd.melt(df, id_vars=['id', 'category', 'Question Type', 'question'], var_name='Algorithm', value_name='Correctness')
    
    
    df['Count'] = 0
    # print(df)
    df = df.groupby(['Question Type', 'Algorithm', 'Correctness']).agg(
        {'Count': 'count'}).unstack(fill_value=0).stack().reset_index()
    df['Count'] = (df['Count'] / num_questions_per_category) * 100
    print(df)
    print("-----------------------------------------------------------------------------")

    question_type = df['Question Type'].unique()
    algorithms = ['LinkQ', 'GPT-4']
    width = 0.35  # Width of the bar
    x = np.arange(len(question_type))  # X-axis positions for question_type

    # Plot side-by-side stacked bars
    fig, ax = plt.subplots()

    for i, algorithm in enumerate(algorithms):
        print("-----------------------------------------------------------------------------")
        # Filter data for the current algorithm
        algorithm_data = df[df['Algorithm'] == algorithm]
        three_three_data = algorithm_data.loc[algorithm_data['Correctness'] == '3/3']['Count'].reset_index(drop=True)
        two_three_data = algorithm_data.loc[algorithm_data['Correctness'] == '2/3']['Count'].reset_index(drop=True)
        one_three_data = algorithm_data.loc[algorithm_data['Correctness'] == '1/3']['Count'].reset_index(drop=True)
        color3 = tmp_palette[f'{algorithm} 3/3']
        color2 = tmp_palette[f'{algorithm} 2/3']
        color1 = tmp_palette[f'{algorithm} 1/3']
        
        print("algorithm",algorithm)
        print("three_three_data",three_three_data)
        print("two_three_data",two_three_data)
        print("added",two_three_data+three_three_data)
        bar3 = ax.bar(x + (i - 0.5) * width, three_three_data, width, color=color3, label=f'{algorithm} 3/3 Correct')
        bar2 = ax.bar(x + (i - 0.5) * width, two_three_data, width, color=color2, bottom=three_three_data, label=f'{algorithm} 2/3 Correct')
        bar1 = ax.bar(x + (i - 0.5) * width, one_three_data, width, color=color1, bottom=two_three_data+three_three_data, label=f'{algorithm} 1/3 Correct')
    ax.set_xlabel('Question Type')
    ax.set_ylabel('% Correct')
    ax.set_title('Side-by-Side Stacked Bar Chart')
    ax.set_xticks(x)
    ax.set_xticklabels(question_type)
    ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plt.savefig(Path(PLOTS, f'correctness_stacked.pdf'), bbox_inches='tight', format='pdf')
    plt.close()



    fig, ax = plt.subplots()
    for i, algorithm in enumerate(algorithms):
        print("-----------------------------------------------------------------------------")
        # Filter data for the current algorithm
        algorithm_data = df[df['Algorithm'] == algorithm]
        three_three_data = algorithm_data.loc[algorithm_data['Correctness'] == '3/3']['Count'].reset_index(drop=True)
        two_three_data = algorithm_data.loc[algorithm_data['Correctness'] == '2/3']['Count'].reset_index(drop=True)
        one_three_data = algorithm_data.loc[algorithm_data['Correctness'] == '1/3']['Count'].reset_index(drop=True)
        zero_three_data = algorithm_data.loc[algorithm_data['Correctness'] == '0/3']['Count'].reset_index(drop=True)
        color3 = tmp_palette[f'{algorithm} 3/3']
        color2 = tmp_palette[f'{algorithm} 2/3']
        color1 = tmp_palette[f'{algorithm} 1/3']
        color0 = tmp_palette[f'{algorithm} 0/3']
        
        print("algorithm",algorithm)
        print("three_three_data",three_three_data)
        print("two_three_data",two_three_data)
        print("added",two_three_data+three_three_data)
        bar3 = ax.bar(x + (i - 0.5) * width, three_three_data, width, color=color3, label=f'{algorithm} 3/3 Correct')
        bar2 = ax.bar(x + (i - 0.5) * width, two_three_data, width, color=color2, bottom=three_three_data, label=f'{algorithm} 2/3 Correct')
        bar1 = ax.bar(x + (i - 0.5) * width, one_three_data, width, color=color1, bottom=two_three_data+three_three_data, label=f'{algorithm} 1/3 Correct')
        bar0 = ax.bar(x + (i - 0.5) * width, zero_three_data, width, color=color0, bottom=one_three_data+two_three_data+three_three_data, label=f'{algorithm} 0/3 Correct')
    ax.set_xlabel('Question Type')
    ax.set_ylabel('% Correct')
    ax.set_title('Side-by-Side Stacked Bar Chart')
    ax.set_xticks(x)
    ax.set_xticklabels(question_type)
    ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plt.savefig(Path(PLOTS, f'correctness_stacked_zeros.pdf'), bbox_inches='tight', format='pdf')
    # plt.show()
    plt.close()

def main():
    PLOTS.mkdir(exist_ok=True)
    accuracy_barchart_by_category()
    timing_boxplot_by_category()
    # correctness_barchart_by_algorithm(target_column_name="linkqAnswerCorrect",y_axis_label="LinkQ Correctness",output_name="linkq_correctness",palette={"0/3": '#999999', "1/3": '#c8ddec', "2/3": '#72aad0', "3/3": '#1f78b4'})
    # correctness_barchart_by_algorithm(target_column_name="plainLLMAnswerCorrect",y_axis_label="GPT-4 Correctness",output_name="plainllm_correctness",palette={"0/3": '#999999', "1/3": '#fff4e5', "2/3": '#ffdeb3', "3/3": '#fdbf6f'})
    correctness_barchart()
    correctness_stacked_barchart()
    print("Done creating plots!")


if __name__ == '__main__':
    main()
