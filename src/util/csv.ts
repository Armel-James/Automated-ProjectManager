import Papa from "papaparse";

export interface CSVItemData {
  name: string;
  duration: number;
  notes?: string;
  startDate: Date;
}

// Function to handle CSV file upload and parse it to JSON
export const convertCSVFiletoJSON = (
  csvFile: File
): Promise<CSVItemData[] | null> => {
  return new Promise((resolve, reject) => {
    try {
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          results.data.map((item: any) => {
            if (item.startDate) {
              item.startDate = new Date(item.startDate);
            }
          });

          if (validateData(results.data as CSVItemData[])) {
            resolve(results.data as CSVItemData[]);
          } else {
            resolve(null);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV file:", error);
          reject(error);
        },
      });
    } catch (error) {
      console.error("Error parsing CSV file:", error);
      reject(error);
    }
  });
};

// Function to validate JSON data structure
export const validateData = (data: CSVItemData[]): boolean => {
  data.forEach((item, index) => {
    console.log("Validating item:", item);
    if (!item.name || typeof item.name !== "string") {
      throw new Error(`Invalid or missing 'name' at row ${index + 1}`);
    }

    if (!item.duration || isNaN(Number(item.duration))) {
      throw new Error(`Invalid or missing 'duration' at row ${index + 1}`);
    }

    if (item.startDate && !(item.startDate instanceof Date)) {
      throw new Error(`Invalid 'startDate' at row ${index + 1}`);
    }

    if (item.notes && typeof item.notes !== "string") {
      throw new Error(`Invalid 'notes' at row ${index + 1}`);
    }
  });

  return true;
};
