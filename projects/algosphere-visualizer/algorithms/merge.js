export async function mergeSort(arr, container, speed) {
  const bars = container.children;

  async function merge(start, mid, end) {
    let left = arr.slice(start, mid + 1);
    let right = arr.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
      bars[k].style.background = "red";
      await new Promise((r) => setTimeout(r, speed));
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        bars[k].style.height = `${arr[k]}px`;
        i++;
      } else {
        arr[k] = right[j];
        bars[k].style.height = `${arr[k]}px`;
        j++;
      }
      bars[k].style.background = "#00f0ff";
      k++;
    }

    while (i < left.length) {
      bars[k].style.background = "red";
      await new Promise((r) => setTimeout(r, speed));
      arr[k] = left[i];
      bars[k].style.height = `${arr[k]}px`;
      bars[k].style.background = "#00f0ff";
      i++;
      k++;
    }

    while (j < right.length) {
      bars[k].style.background = "red";
      await new Promise((r) => setTimeout(r, speed));
      arr[k] = right[j];
      bars[k].style.height = `${arr[k]}px`;
      bars[k].style.background = "#00f0ff";
      j++;
      k++;
    }
  }

  async function mergeSortRecursive(start, end) {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    await mergeSortRecursive(start, mid);
    await mergeSortRecursive(mid + 1, end);
    await merge(start, mid, end);
  }

  await mergeSortRecursive(0, arr.length - 1);

  // Mark all bars as sorted
  for (let i = 0; i < arr.length; i++) {
    bars[i].style.background = "#00ff88";
    await new Promise((r) => setTimeout(r, speed / 2));
  }
}
