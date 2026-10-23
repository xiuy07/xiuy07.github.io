class Rectangle:
    def __init__(self, width, height):
        if width < 0 or height < 0:
            raise ValueError("negative side")
        self._width, self._height = width, height
    @property
    def area(self):
        return self._width * self._height

r = Rectangle(3, 5)
print(r.area)
