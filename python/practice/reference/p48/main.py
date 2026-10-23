class IntSpan:
    def __init__(self, start, stop, step):
        if step == 0:
            raise ValueError('zero step')
        self._range = range(start, stop + (1 if step > 0 else -1), step)
    def __iter__(self):
        return iter(self._range)
    def __len__(self):
        return len(self._range)
    def __contains__(self, value):
        return value in self._range

def solve(data):
    values = IntSpan(data['start'], data['stop'], data['step'])
    return {'values': list(values), 'length': len(values), 'contains': [q in values for q in data['queries']]}
