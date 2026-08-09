---
name: python-quant-code-quality
description: "Enforces strict Python coding standards, PEP 8 compliance, rigorous type hinting, and comprehensive docstrings. Use when generating, refactoring, or reviewing Python code for quantitative models and backtests."
metadata:
  author: "quant-user"
  version: "1.0"
  tags: ["python", "code-quality", "documentation", "quantitative-finance"]
---

# Python Code Quality and Documentation Standards

## When To Use
- Generating new Python scripts for trading signals, data pipelines, or backtests.
- Refactoring existing code to make it production-ready and highly readable.
- Adding missing documentation to legacy scripts so they can be easily understood and reused by other quantitative analysts.

## 1. Coding Standards (PEP 8 & Best Practices)
Whenever you write or modify Python code, you MUST adhere to the following rules:
- **No loops when vectorization is possible:** Always prefer `pandas` or `numpy` vectorized operations over `for` loops for performance.
- **Explicit Typing:** Use Type Hints (`typing` module) for ALL function arguments and return values (e.g., `def calculate_sharpe(returns: pd.Series, risk_free_rate: float = 0.0) -> float:`).
- **Modern Python:** Use f-strings (`f"{var}"`) instead of `.format()` or `%`.
- **Exception Handling:** Never use bare `except:`. Always catch specific exceptions (e.g., `except ValueError as e:`) and log the error context clearly.
- **Modularity:** Break down monolithic scripts into small, single-purpose functions (SOLID principles).

## 2. Rigorous Documentation (Docstrings)
Every module, class, and public function MUST include a comprehensive docstring following the Google or NumPy docstring format.
A complete function docstring must include:
1. **Summary:** A concise one-line description of what the function computes.
2. **Mathematical context (if applicable):** Briefly explain the quantitative formula used (e.g., "Calculates the annualized Sharpe ratio assuming 252 trading days").
3. **Args:** Name, type, and description of each parameter. State if it expects annualized or daily data.
4. **Returns:** Type and description of the output.
5. **Raises:** Any specific errors the function might intentionally raise (e.g., `ValueError` if the dataframe is empty).

*Example format:*
```python
def calculate_drawdown(equity_curve: pd.Series) -> pd.Series:
    """
    Calculates the rolling maximum drawdown for a given equity curve.

    Args:
        equity_curve (pd.Series): A pandas Series representing cumulative portfolio value.

    Returns:
        pd.Series: A Series of the same length containing the percentage drawdown from the peak (negative values).

    Raises:
        ValueError: If the input equity_curve is empty or contains negative values.
    """
