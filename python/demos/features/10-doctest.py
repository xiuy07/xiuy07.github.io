def label(score):
    """Return a pass/fail label.

    >>> label(60)
    'pass'
    >>> label(59)
    'fail'
    """
    return "pass" if score >= 60 else "fail"

if __name__ == "__main__":
    import doctest
    result = doctest.testmod()
    print(result.failed, result.attempted)
