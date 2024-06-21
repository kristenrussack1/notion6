const getDataFromBackend = async () => {
  const response = await fetch("https://kristenrussack1.github.io/notion6/", { mode: 'no-cors' });
  const data = await response.json();
  return data;
};

const addData = async () => {
  const data = await getDataFromBackend();
  const container = document.getElementById("container");

  data.forEach((value) => {
    const div = document.createElement("div");
    div.classList.add("userContainer");
    div.innerHTML = `
      <h3>${value.projectName}</h3>
      <p><strong>Start Date:</strong> ${value.startDate}</p>
      <p><strong>End Date:</strong> ${value.endDate || "N/A"}</p>
       <p> ${value.parentItem || "N/A"}</p>
      <p> ${value.subItemNames || "N/A"}</p>
      <p> ${value.rollupProgress|| "0"}</p>
    `;
    container.appendChild(div);
  });
};

addData();
