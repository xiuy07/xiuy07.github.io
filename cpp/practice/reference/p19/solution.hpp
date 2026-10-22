#pragma once
struct Person {
    int id;
    explicit Person(int x):id(x) {
    }
};
struct Student:virtual Person {
    explicit Student(int x):Person(x) {
    }
};
struct Worker:virtual Person {
    explicit Worker(int x):Person(x) {
    }
};
struct Assistant:Student,Worker {
    explicit Assistant(int x):Person(x),Student(x+1),Worker(x+2) {
    }
};
