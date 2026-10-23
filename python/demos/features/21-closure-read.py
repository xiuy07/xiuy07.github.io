rate = 100
def make_scale(rate):
    def scale(value):
        return value * rate
    return scale

triple = make_scale(3)
rate = 200
print(triple(4))
