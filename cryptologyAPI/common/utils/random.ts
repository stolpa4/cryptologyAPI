export function int(min = 0, max = 100) {
    [min, max] = [Math.ceil(min), Math.floor(max)];
    return Math.floor(Math.random() * (max - min)) + min;
}
