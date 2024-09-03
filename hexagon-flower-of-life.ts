import fs from "fs";

// Generates a serpentine hexagonal 2D ledmap.json for WLED.
// This fits a flower of life pattern.
// This adds blanks (-1) to the array to keep the correct the aspect ratio.

// Set the size here
const size = 13;

let goingDown = false;

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
  if (rowNumber === 1) goingDown = false;

  const totalRowLength = (size - 1) * 2 + size;

  if (!goingDown) {
    // Going up
    const padding = size - rowNumber; // Calculate padding based on rowNumber

    // Insert padding (-1s) before the numbers
    for (let index = 0; index < padding; index++) {
      row.push(-1);
    }

    // Insert numbers
    for (let index = 0; index < totalRowLength - padding * 2; index++) {
      row.push(currentLEDIndex++);

      //if this isn't the last number, insert a -1
      if (index !== totalRowLength - padding * 2 - 1) {
        row.push(-1);
      }
    }

    // Insert padding (-1s) after the numbers
    for (let index = 0; index < padding; index++) {
      row.push(-1);
    }

    // If the row has reached the maximum width, switch to going down
    if (row.filter((element) => element !== -1).length === totalRowLength) {
      goingDown = true;
    }
  } else {
    // Going down
    const adjustedRowNumber = rowNumber - size - 1;

    for (let index = 0; index < adjustedRowNumber + 1; index++) {
      row.push(-1);
    }

    for (
      let index = 0;
      index < totalRowLength - (adjustedRowNumber + 1) * 2;
      index++
    ) {
      row.push(currentLEDIndex++);

      //if this isn't the last number, insert a -1
      if (index !== totalRowLength - (adjustedRowNumber + 1) * 2 - 1) {
        row.push(-1);
      }
    }

    for (let index = 0; index < adjustedRowNumber + 1; index++) {
      row.push(-1);
    }
  }

  // if the row number is even, reverse it
  if (rowNumber % 2 === 0) {
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
  let rowNumber = 1;
  let continueLooping = true;

  while (continueLooping) {
    const { row, newLEDIndex } = generateRow({
      size,
      rowNumber,
      currentLEDIndex,
    });

    currentLEDIndex = newLEDIndex;

    //append the column to the hexArray
    hexArray.push(row);

    //if row has size number of elements that are not -1, then we are done

    const itemsInRowThatAreNotNegativeOne = row.filter(
      (element) => element !== -1
    );

    continueLooping = !(
      itemsInRowThatAreNotNegativeOne.length === size && rowNumber !== 1
    );

    continueLooping = continueLooping ? rowNumber < 30 : false;

    ++rowNumber;
  }

  return hexArray;
};

const formatPrint2DArrayAsReadableJSON = (array: number[][]) => {
  return (
    "[" +
    array
      .map((row) => "[" + row.map((num) => num.toString()).join(",\t") + "]")
      .join(",\n ") +
    "]"
  );
};

const array = generateHexagonal2DArray(size);

const formatted = formatPrint2DArrayAsReadableJSON(array);

console.log(formatted);

//make the tmp directory if it doesn't exist
if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

//write the output to a file
fs.writeFileSync("./tmp/ledmap.json", formatted);
