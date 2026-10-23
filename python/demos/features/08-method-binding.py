class Basket:
    def __init__(self, items):
        self.items = list(items)
    def __len__(self):
        return len(self.items)
    def add(self, item):
        self.items.append(item)

b = Basket(["tea"])
Basket.add(b, "milk")
print(len(b), b.items)
