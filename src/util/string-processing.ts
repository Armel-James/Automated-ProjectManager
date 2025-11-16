// Notification Type

export function NotificationTypeToReadableString(type: string): string {
  const typeStringArray = type.split("_");
  for (let i = 0; i < typeStringArray.length; i++) {
    typeStringArray[i] =
      typeStringArray[i].charAt(0).toUpperCase() + typeStringArray[i].slice(1);
  }
  return typeStringArray.join(" ");
}

export function capitalizeWords(str: string): string {
  return str
    .split(" ") // Split the string into an array of words
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize the first letter and make the rest lowercase
    )
    .join(" "); // Join the words back into a single string
}
