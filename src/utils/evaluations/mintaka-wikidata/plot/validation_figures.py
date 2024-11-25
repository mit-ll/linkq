# Copyright (c) 2024 Massachusetts Institute of Technology
# SPDX-License-Identifier: MIT

from pathlib import Path

from functools import reduce
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

CORRECTNESS_PALETTE = {"LinkQ 0/3": '#999999', "LinkQ 1/3": '#c8ddec', "LinkQ 2/3": '#72aad0', "LinkQ 3/3": '#1f78b4', "GPT-4 0/3": '#999999', "GPT-4 1/3": '#fff4e5', "GPT-4 2/3": '#ffdeb3', "GPT-4 3/3": '#fdbf6f'}
QUESTION_TYPE_ORDER = ['Comparative', 'Yes/No', 'Generic', 'MultiHop', "Intersection"]
PALETTE = {'LinkQ': '#1f78b4', 'GPT-4': '#fdbf6f'}
TO_REPLACE = {'multihop': 'MultiHop', 'generic': 'Generic', 'intersection': 'Intersection', 'yesno': 'Yes/No', 'comparative': 'Comparative'}

def accuracy_barchart_by_category():
    # Load the data and rename certain columns and values
    df = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=['linkqAnswerCorrect', 'plainLLMAnswerCorrect', 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={'linkqAnswerCorrect': 'LinkQ', 'plainLLMAnswerCorrect': 'GPT-4', 'complexityType': 'Question Type'})
    df = df.replace(to_replace=TO_REPLACE)
    
    num_questions_per_type = len(df) // len(df['Question Type'].unique()) # Assumes same number of questions per category
    df['LinkQ'] = (df['LinkQ'] > 0).astype(int)
    df['GPT-4'] = (df['GPT-4'] > 0).astype(int)

    # Unpivot the LinkQ and GPT-4 columns into Algorithm and Correctness columns
    df = pd.melt(df, id_vars=['id', 'category', 'Question Type', 'question'], var_name='Algorithm', value_name='Correct')

    # Count the correctness values and convert them into percentages
    df = df.groupby(['Question Type', 'Algorithm']).agg({'Correct': 'sum'}).sort_values(by='Correct',ascending=False).reset_index()
    df['Fraction'] = [f'{v}/{num_questions_per_type}' for v in df['Correct']]
    df['% Correct'] = (df['Correct'] / num_questions_per_type) * 100

    # Plot the data
    ax = sns.barplot(df, x='Question Type', y='% Correct', order=['Comparative', 'Yes/No', 'Generic', 'MultiHop', "Intersection"], hue='Algorithm', hue_order=['LinkQ', 'GPT-4'], palette=PALETTE)

    for container in ax.containers:
        ax.bar_label(container, fmt=percent_formatter)
    plt.savefig(Path(PLOTS, 'accuracy_barchart_by_category.pdf'), bbox_inches='tight', format='pdf')
    plt.close()


def timing_boxplot_by_category():
    # Load the data and rename certain columns and values
    timing_columns = ['Total Seconds', 'id', 'complexityType', 'category']
    linkq_df = pd.read_csv(Path(DATA, 'linkq-evaluation-results.csv'), usecols=timing_columns)
    linkq_df['Algorithm'] = 'LinkQ'
    plainllm_df = pd.read_csv(Path(DATA, 'plainllm-evaluation-results.csv'), usecols=timing_columns)
    plainllm_df['Algorithm'] = 'GPT-4'
    df = pd.concat([linkq_df, plainllm_df]).reset_index(drop=True)
    df = df.rename(columns={'complexityType': 'Question Type'})
    df = df.replace(to_replace=TO_REPLACE)

    sns.boxplot(df, x='Question Type', y='Total Seconds', order=QUESTION_TYPE_ORDER, hue='Algorithm', palette=PALETTE)
    plt.savefig(Path(PLOTS, 'timing_boxplot_by_category.pdf'), bbox_inches='tight', format='pdf')
    plt.close()


def correctness_barchart():
    # Load the data and rename certain columns and values
    df = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=['linkqAnswerCorrect', 'plainLLMAnswerCorrect', 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={'linkqAnswerCorrect': 'LinkQ', 'plainLLMAnswerCorrect': 'GPT-4', 'complexityType': 'Question Type'})
    df = df.replace(to_replace=TO_REPLACE)
    df['LinkQ'] = df['LinkQ'].apply(lambda x: f'LinkQ {x}/3')
    df['GPT-4'] = df['GPT-4'].apply(lambda x: f'GPT-4 {x}/3')

    # Assumes same number of questions per category
    num_questions_per_type = len(df) // len(df['Question Type'].unique()) # Assumes same number of questions per category

    # Unpivot the LinkQ and GPT-4 columns into Algorithm and Correctness columns
    df = pd.melt(df, id_vars=['id', 'category', 'Question Type', 'question'], var_name='Algorithm', value_name='Correctness')

    # Count the correctness values and convert them into percentages
    df['Value'] = 0
    df = df.groupby(['Question Type', 'Correctness']).agg(
        {'Value': 'count'}).unstack(fill_value=0).stack(future_stack=True).reset_index()
    df['Value'] = (df['Value'] / num_questions_per_type) * 100

    # Plot the data
    ax = sns.barplot(df, x='Question Type', y="Value", order=QUESTION_TYPE_ORDER, hue='Correctness', 
                     hue_order=["LinkQ 3/3","GPT-4 3/3","LinkQ 2/3","GPT-4 2/3","LinkQ 1/3","GPT-4 1/3"], 
                     palette=CORRECTNESS_PALETTE)

    for container in ax.containers:
        ax.bar_label(container, fmt=percent_formatter)
    plt.savefig(Path(PLOTS, f'correctness.pdf'), bbox_inches='tight', format='pdf')
    plt.close()


def correctness_stacked_barchart():
    # Load the data and rename certain columns and values
    df = pd.read_csv(Path(DATA, 'aggregated-evaluation-results.csv'), usecols=['linkqAnswerCorrect', 'plainLLMAnswerCorrect', 'complexityType', 'category', 'id', 'question'])
    df = df.rename(columns={'linkqAnswerCorrect': 'LinkQ', 'plainLLMAnswerCorrect': 'GPT-4', 'complexityType': 'Question Type'})
    df = df.replace(to_replace=TO_REPLACE)
    df['LinkQ'] = df['LinkQ'].apply(lambda x: f'{x}/3')
    df['GPT-4'] = df['GPT-4'].apply(lambda x: f'{x}/3')

    # Custom sort the question types to keep all the plots consistent
    df["Question Type"] = pd.Categorical(df["Question Type"], categories=QUESTION_TYPE_ORDER, ordered=True)
    df = df.sort_values("Question Type")

    # Assumes same number of questions per category
    num_questions_per_type = len(df) // len(df['Question Type'].unique())

    # Unpivot the LinkQ and GPT-4 columns into Algorithm and Correctness columns
    df = pd.melt(df, id_vars=['id', 'category', 'Question Type', 'question'], var_name='Algorithm', value_name='Correctness')
    
    # Count the correctness values and convert them into percentages
    df['Value'] = 0
    df = df.groupby(['Question Type', 'Algorithm', 'Correctness'],observed=False).agg(
        {'Value': 'count'}).unstack(fill_value=0).stack(future_stack=True).reset_index()
    df['Value'] = (df['Value'] / num_questions_per_type) * 100

    # Prep the plot data
    question_types = df['Question Type'].unique()
    x = np.arange(len(question_types))  # X-axis positions for question_types
    algorithms = ['LinkQ', 'GPT-4'] # this list determines left to right ordering of the algorithms
    correctness = ['3/3','2/3','1/3'] # this list determines bottom to top stacking order of correctness
    width = 0.35  # Width of the bar

    # Plot side-by-side stacked bars
    fig, ax = plt.subplots()
    for alg_idx, algorithm in enumerate(algorithms):
        # Filter data for the current algorithm
        algorithm_data = df[df['Algorithm'] == algorithm]
        # Filter again by correctness
        filtered_values = list(map(
            lambda x: algorithm_data.loc[algorithm_data['Correctness'] == x]['Value'].reset_index(drop=True),
            correctness))
        
        plot_x = x + (alg_idx - 0.5) * width
        bottom = np.zeros(len(question_types)) # The first correctness bars will be stacked from the bottom
        # Loop over all the correctness to stack the bars on top of each other
        for correct_idx, correct in enumerate(correctness):
            values = filtered_values[correct_idx] # Series containing the values for this algorithm + correctness, by question type
            color = CORRECTNESS_PALETTE[f'{algorithm} {correct}'] # Get the color palette for this algorithm + correctness
            # Stack the bars for this correctness
            bar = ax.bar(
                x=plot_x,
                height=values, 
                width=width, 
                color=color, 
                label=f'{algorithm} {correct}',
                bottom=bottom)
            
            # for xpos, value, y in zip(plot_x, values, bottom):
            #     if value != 0.0:
            #         ax.text(x=xpos, y=y + value/2, s=percent_formatter(value), ha='center', va='center', fontsize=10)
                
            # For the next set of stacked bars, we need to add these count values so we know where we should stack from
            bottom += values

        # Label the percentage sums
        for xpos, total in zip(plot_x, bottom):
            ax.text(x=xpos, y=total + 0.5, s=percent_formatter(total), ha='center', va='bottom', fontsize=10)

    ax.set_xlabel('Question Type')
    ax.set_ylabel('% Correct')
    # ax.set_title('Side-by-Side Stacked Bar Chart')
    ax.set_xticks(x)
    ax.set_xticklabels(question_types)
    ax.legend(title="# Correct / 3 Attempts", title_fontsize=10, bbox_to_anchor=(1, 1), loc='upper left')
    plt.tight_layout()
    plt.savefig(Path(PLOTS, 'correctness_stacked.pdf'), bbox_inches='tight', format='pdf')
    plt.close()

def main():
    PLOTS.mkdir(exist_ok=True)
    accuracy_barchart_by_category()
    timing_boxplot_by_category()
    correctness_barchart()
    correctness_stacked_barchart()
    print("Done creating plots!")


if __name__ == '__main__':
    main()
