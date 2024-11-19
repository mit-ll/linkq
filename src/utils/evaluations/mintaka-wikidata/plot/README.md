1. Download the evaluation results from TODO
2. Place the CSVs from the `../data` folder
3. Rename the CSVs, if applicable:
    - 'Evaluation for CHI - Aggregated Results': 'aggregated-evaluation-results.csv'
    - 'Evaluation for CHI - Plain LLM Evaluation Output': 'plainllm-evaluation-results.csv'
    - 'Evaluation for CHI - LinkQ Evaluation Output': 'linq-evaluation-results.csv'
4. Create a new conda environment, adivate it, and download the requirements
```
conda create --name linkq python=3.12
conda activate linkq
pip install -r requirements.txt
```
5. Run the script to generate the plots
```
python validation_figures.py
```