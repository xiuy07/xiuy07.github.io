from dataclasses import dataclass, field
@dataclass
class Notebook:
    owner: str
    pages: list[str] = field(default_factory=list)
    def __len__(self):
        return len(self.pages)

a, b = Notebook("Alice"), Notebook("Bob")
a.pages.append("objects")
print(len(a), len(b))
print(a.owner, a.pages)
