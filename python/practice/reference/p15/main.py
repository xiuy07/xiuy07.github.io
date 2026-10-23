from dataclasses import dataclass, field
@dataclass
class Notebook:
    owner: str
    pages: list[str] = field(default_factory=list)
def solve(data):
    books = [Notebook(name) for name in data['owners']]
    for index, text in data['writes']:
        books[index].pages.append(text)
    return [[b.owner, b.pages] for b in books]
