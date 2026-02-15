export async function quickSort(arr, container, speed) {
  const bars = container.children;

  async function partition(low, high) {
    let pivot = arr[high];
    bars[high].style.background = "orange";
    let i = low - 1;
    for (let j = low; j < high; j++) {
      bars[j].style.background = "red";
      await new Promise((r) => setTimeout(r, speed));
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        bars[i].style.height = `${arr[i]}px`;
        bars[j].style.height = `${arr[j]}px`;
      }
      bars[j].style.background = "#00f0ff";
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    bars[i + 1].style.height = `${arr[i + 1]}px`;
    bars[high].style.height = `${arr[high]}px`;
    bars[high].style.background = "#00f0ff";
    return i + 1;
  }

  async function quickSortRecursive(low, high) {
    if (low < high) {
      let pi = await partition(low, high);
      await quickSortRecursive(low, pi - 1);
      await quickSortRecursive(pi + 1, high);
    }
  }

  await quickSortRecursive(0, arr.length - 1);

  for (let i = 0; i < arr.length; i++) {
    bars[i].style.background = "#00ff88";
    await new Promise((r) => setTimeout(r, speed / 2));
  }
}
