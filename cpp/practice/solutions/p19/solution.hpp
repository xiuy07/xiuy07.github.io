#pragma once
struct Person {
    int id;
    explicit Person(int x):id(x) {
    }
};
// TODO: 改正两条继承路径，让 Assistant 只有一份 Person。
struct Student:Person {
    explicit Student(int x):Person(x) {
    }
};
struct Worker:Person {
    explicit Worker(int x):Person(x) {
    }
};
struct Assistant:Student,Worker {
    explicit Assistant(int x):Student(x),Worker(x) {
    }
};
