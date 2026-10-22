#include <iostream>
class Document {
    virtual void write(std::ostream& out) const=0;
public:
    virtual ~Document()=default;
    void render(std::ostream& out) const { out << '['; write(out); out << ']'; }
    friend std::ostream& operator<<(std::ostream& out,const Document& d) {
        d.render(out); return out;
    }
};
class Text:public Document {
    void write(std::ostream& out) const override { out << "hello"; }
};
int main() { Text t; const Document& d=t; std::cout << d << '\n'; }
