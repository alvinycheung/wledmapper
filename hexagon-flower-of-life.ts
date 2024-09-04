import fs from "fs";

// Generates a serpentine hexagonal 2D ledmap.json for WLED.
// This fits a flower of life pattern.
// This adds blanks (-1) to the array to keep the correct aspect ratio.

// Set the size here
const size = 8;

let goingUp = true;

const insertInternalPadding = true;

const generateRow = ({
  size,
  rowNumber,
  currentLEDIndex,
}: {
  size: number;
  rowNumber: number;
  currentLEDIndex: number;
}): {
  row: number[];
  newLEDIndex: number;
} => {
  const row: number[] = [];
  if (rowNumber === 0) goingUp = true;

  const totalRowLength = size + (size - 1) * 2;

  if (goingUp) {
    const padding = size - rowNumber - 1; // Calculate padding based on rowNumber

    // Insert padding (-1s) before the numbers
    for (let index = 0; index < padding; index++) {
      row.push(-1);
    }

    // Insert numbers with optional internal padding
    for (let index = 0; index < size + rowNumber; index++) {
      row.push(currentLEDIndex++);

      // Insert internal padding (-1) between numbers, but only if not at the last number
      if (insertInternalPadding && index !== size + rowNumber - 1) {
        row.push(-1);
      }
    }

    // Insert padding (-1s) after the numbers
    for (let index = 0; index < padding; index++) {
      row.push(-1);
    }

    // If the row has numbers in the 0 and last index, switch to going down
    if (row[0] !== -1 && row[row.length - 1] !== -1) {
      goingUp = false;
    }
  } else {
    // Going down
    const padding = rowNumber - size + 1; // Calculate padding based on rowNumber

    // Insert padding (-1s) before the numbers
    for (let index = 0; index < padding; index++) {
      row.push(-1);
    }

    // Insert numbers with optional internal padding
    for (let index = 0; index < 3 * size - 2 - rowNumber; index++) {
      row.push(currentLEDIndex++);

      // Insert internal padding (-1) between numbers, but only if not at the last number
      if (insertInternalPadding && index !== 3 * size - 3 - rowNumber) {
        row.push(-1);
      }
    }

    // Insert padding (-1s) after the numbers
    for (let index = 0; index < padding; index++) {
      row.push(-1);
    }
  }

  //If the row number is odd, reverse it
  if (rowNumber % 2 === 1) {
    row.reverse();
  }

  return {
    row,
    newLEDIndex: currentLEDIndex,
  };
};

const generateHexagonal2DArray = (size: number) => {
  const hexArray: number[][] = [];

  let currentLEDIndex = 0;
  let rowNumber = 0;
  let continueLooping = true;

  while (continueLooping) {
    const { row, newLEDIndex } = generateRow({
      size,
      rowNumber,
      currentLEDIndex,
    });

    currentLEDIndex = newLEDIndex;

    // Append the row to the hexArray
    hexArray.push(row);

    const itemsInRowThatAreNotNegativeOne = row.filter(
      (element) => element !== -1
    );

    continueLooping =
      rowNumber <= 25 &&
      !(itemsInRowThatAreNotNegativeOne.length === size && rowNumber !== 0);

    ++rowNumber;
  }

  return hexArray;
};

const formatPrint2DArrayAsReadableJSON = (array: number[][]) => {
  return (
    "[" +
    array
      .map((row) => row.map((num) => num.toString()).join(",\t"))
      .join(",\n ") +
    "]"
  );
};

const array = generateHexagonal2DArray(size);
const transposed = array[0].map((_, colIndex) =>
  array.map((row) => row[colIndex])
);

// Make the tmp directory if it doesn't exist
if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

// wrap formatted in {"map": formatted}
const output = JSON.stringify({
  map: "replaceMe",
  size: {
    width: array[0].length,
    height: array.length,
    size: array.length * array[0].length,
  },
})
  .toString()
  .replace('"replaceMe"', formatPrint2DArrayAsReadableJSON(transposed))
  .replace('{"map":[', '{"map":[\n')
  .replace(',"size":{', ',\n"size":{');

// Print the output
console.log(output);

// Write the output to a file
fs.writeFileSync("./tmp/ledmap.json", output);

// print current directory path
console.log(`\nWrote to: ${__dirname}/tmp/ledmap.json`);
