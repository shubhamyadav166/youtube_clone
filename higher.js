function higherOrderfn(fn, x, y) {
    return fn(x, y);
}

function add(a, b) {
    return a + b;
}

let value = higherOrderfn(add, 5, 5)
console.log(value);
