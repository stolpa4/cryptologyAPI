export function int(min = 0, max = 100) {
    [min, max] = [Math.ceil(min), Math.floor(max)];
    if (max <= min) throw new Error(`Error generating an int number in range [min;max)! Max (${max}) <= min (${min}).`);
    return Math.floor(Math.random() * (max - min)) + min;
}
