import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

# ============================================================================
# CENTRALIZED DATA CONFIGURATION
# ============================================================================
# Question types
QUESTIONS = ['Comparative', 'Yes/No', 'Generic', 'Multihop', 'Intersection']

# Performance data for each method
GPT4 = [20.8, 54.2, 33.3, 16.7, 12.5]
LINKQ_GPT4 = [91.7, 87.5, 79.2, 75, 54.2]
LLAMA3 = [16.7, 29.2, 8.3, 4.2, 0]
LINKQ_LLAMA3 = [54.2, 75, 54.2, 45.8, 25]

# Define custom color palette for each method
COLORS = {
    'LinkQ + GPT4': '#1f78b4',
    'GPT4': '#5E9BC4',
    'LinkQ + Llama3': '#FC9223',
    'Llama-3.3-70B-Instruct': '#FFC491'
}

# ============================================================================
# DATA PREPARATION
# ============================================================================
# Create DataFrame for plotting
data = {
    'Question': [q for q in QUESTIONS for _ in range(4)],
    'Method': ['LinkQ + GPT4', 'LinkQ + Llama3', 'GPT4', 'Llama-3.3-70B-Instruct'] * len(QUESTIONS),
    'Percentage': []
}

# Interleave the data: Exp1, Base1, Exp2, Base2 for each question
for i in range(len(QUESTIONS)):
    data['Percentage'].extend([
        LINKQ_GPT4[i],
        LINKQ_LLAMA3[i],
        GPT4[i],
        LLAMA3[i]
    ])

df = pd.DataFrame(data)

# Calculate improvements for Figure 3
IMPROVEMENT_METHOD_1 = [exp - base for exp, base in zip(LINKQ_GPT4, GPT4)]
IMPROVEMENT_METHOD_2 = [exp - base for exp, base in zip(LINKQ_LLAMA3, LLAMA3)]

# Set style
sns.set_style("whitegrid")
sns.set_palette(COLORS.values())
plt.rcParams['figure.figsize'] = (12, 6)


# ============================================================================
# FIGURE 1: All Methods Comparison
# ============================================================================
plt.figure(figsize=(12, 6))
ax1 = sns.barplot(
    data=df,
    x='Question',
    y='Percentage',
    hue='Method',
    palette=COLORS,
    linewidth=0
)
ax1.grid(False)
ax1.set_xlabel('Question Type', fontsize=14)
ax1.set_ylabel('Correctness %', fontsize=14)
ax1.set_title('LinkQ, GPT4, and Llama3 Evaluation', 
             fontsize=16, fontweight='bold', pad=20)

plt.legend(title='Method', title_fontsize=12, fontsize=10, 
           loc='upper right', frameon=True)

for container in ax1.containers:
    ax1.bar_label(container, fmt='%.1f%%', padding=3, fontsize=9)

ax1.set_ylim(0, 100)
ax1.tick_params(axis='both', labelsize=11)
plt.tight_layout()
plt.savefig('figure1_all_methods.png', dpi=300, bbox_inches='tight')
plt.show()

# ============================================================================
# FIGURE 2: Baseline Methods Only
# ============================================================================
df_baseline = df[df['Method'].isin(['GPT4', 'Llama-3.3-70B-Instruct'])]

# Set up bar positions
x = np.arange(len(QUESTIONS))
width = 0.35

fig, ax2 = plt.subplots(figsize=(12, 6))
ax2.grid(False)

# Create bars manually to match Figure 3 spacing
baseline1_data = df_baseline[df_baseline['Method'] == 'GPT4']['Percentage'].values
baseline2_data = df_baseline[df_baseline['Method'] == 'Llama-3.3-70B-Instruct']['Percentage'].values

bars_base1 = ax2.bar(x - width/2, baseline1_data, width,
                     label='GPT4',
                     color=COLORS['GPT4'], linewidth=0)
bars_base2 = ax2.bar(x + width/2, baseline2_data, width,
                     label='Llama-3.3-70B-Instruct',
                     color=COLORS['Llama-3.3-70B-Instruct'], linewidth=0)

# Add percentage labels on top of bars
for i, (base1, base2) in enumerate(zip(baseline1_data, baseline2_data)):
    ax2.text(i - width/2, base1 + 1, f'{base1:.1f}%', ha='center', va='bottom', fontsize=9, fontweight='bold')
    ax2.text(i + width/2, base2 + 1, f'{base2:.1f}%', ha='center', va='bottom', fontsize=9, fontweight='bold')

ax2.set_xlabel('Question Type', fontsize=14)
ax2.set_ylabel('Percentage (%)', fontsize=14)
ax2.set_title('Baseline Methods Evaluation', 
             fontsize=16, fontweight='bold', pad=20)

ax2.set_xticks(x)
ax2.set_xticklabels(QUESTIONS)
ax2.set_ylim(0, 100)
ax2.tick_params(axis='both', labelsize=11)
ax2.legend(title='Method', title_fontsize=12, fontsize=10,
          loc='upper right', frameon=True)

plt.tight_layout()
plt.savefig('figure2_baseline_methods.png', dpi=300, bbox_inches='tight')
plt.show()

# ============================================================================
# FIGURE 3: Experimental Methods with Stacked Bars Showing Improvement
# ============================================================================
fig, ax3 = plt.subplots(figsize=(12, 6))
ax3.grid(False)

# Create stacked bars for LinkQ + GPT4
bars1_base = ax3.bar(x - width/2, GPT4, width, 
                     label='GPT4 Performance',
                     color=COLORS['GPT4'], linewidth=0)
bars1_improvement = ax3.bar(x - width/2, IMPROVEMENT_METHOD_1, width,
                           bottom=GPT4,
                           label='LinkQ + GPT4 Improvement',
                           color=COLORS['LinkQ + GPT4'], linewidth=0)

# Create stacked bars for LinkQ + Llama3
bars2_base = ax3.bar(x + width/2, LLAMA3, width,
                     label='Llama-3.3-70B-Instruct Performance',
                     color=COLORS['Llama-3.3-70B-Instruct'], linewidth=0)
bars2_improvement = ax3.bar(x + width/2, IMPROVEMENT_METHOD_2, width,
                           bottom=LLAMA3,
                           label='LinkQ + Llama3 Improvement',
                           color=COLORS['LinkQ + Llama3'], linewidth=0)

# Add total percentage labels on top of bars
for i, (exp1, exp2) in enumerate(zip(LINKQ_GPT4, LINKQ_LLAMA3)):
    ax3.text(i - width/2, exp1 + 1, f'{exp1}%', ha='center', va='bottom', fontsize=9, fontweight='bold')
    ax3.text(i + width/2, exp2 + 1, f'{exp2}%', ha='center', va='bottom', fontsize=9, fontweight='bold')

# Add improvement labels in the improvement section
for i, (imp1, base1, imp2, base2) in enumerate(zip(IMPROVEMENT_METHOD_1, GPT4, 
                                                     IMPROVEMENT_METHOD_2, LLAMA3)):
    ax3.text(i - width/2, base1 + imp1/2, f'+{imp1:.1f}%', ha='center', va='center', 
             fontsize=9, fontweight='bold', color='white')
    ax3.text(i + width/2, base2 + imp2/2, f'+{imp2:.1f}%', ha='center', va='center', 
             fontsize=9, fontweight='bold', color='white')

ax3.set_xlabel('Question Type', fontsize=14)
ax3.set_ylabel('Correctness %', fontsize=14)
ax3.set_title('LinkQ Improvements on Baseline Methods', 
             fontsize=16, fontweight='bold', pad=20)
ax3.set_xticks(x)
ax3.set_xticklabels(QUESTIONS)
ax3.set_ylim(0, 100)
ax3.tick_params(axis='both', labelsize=11)
ax3.legend(title='Method', title_fontsize=12, fontsize=10, 
           loc='upper right', frameon=True)

plt.tight_layout()
plt.savefig('figure3_experimental_improvements.png', dpi=300, bbox_inches='tight')
plt.show()