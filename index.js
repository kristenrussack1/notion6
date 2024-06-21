require("dotenv").config();
const { Client } = require("@notionhq/client");

// Initialize Notion client with API key
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Retrieve Notion database ID from environment variables
const databaseId = process.env.NOTION_API_DATABASE;



async function fetchProjects() {
  const response = await notion.databases.query({ database_id: databaseId });
  
  // First filter out sub-items
  const projects = response.results.filter(page => {
    return !(page.properties["Parent item"] && page.properties["Parent item"].relation.length > 0);
  });

  projects.sort((a, b) => {
    const startDateA = a.properties["Start Date"] && a.properties["Start Date"].date
      ? new Date(a.properties["Start Date"].date.start)
      : new Date('01-01-2024');
    const startDateB = b.properties["Start Date"] && b.properties["Start Date"].date
      ? new Date(b.properties["Start Date"].date.start)
      : new Date('01-01-2024');
    return startDateA - startDateB;
  });



  async function getSubItems(parentId) {
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          property: "Parent item",
          relation: {
            contains: parentId
          }
        }
      });

      
  
      console.log("This is the response:", JSON.stringify(response.results, null, 2));
  

        const sortedSubItems = response.results.sort((a, b) => {
          const startDateA = a.properties["Start Date"] && a.properties["Start Date"].date
            ? new Date(a.properties["Start Date"].date.start)
            : new Date('01-01-2024');
          const startDateB = b.properties["Start Date"] && b.properties["Start Date"].date
            ? new Date(b.properties["Start Date"].date.start)
            : new Date('01-01-2024');
          return startDateA - startDateB;
        });




        // return response.results.map(subItem => {

          return sortedSubItems.map(subItem => {
        console.log("This is the sub itme id ", subItem["id"])


        const subitemId = subItem.id;


        const milestoneProperty = subItem.properties["Milestone"];
        const title = milestoneProperty && milestoneProperty.title && milestoneProperty.title.length > 0
          ? milestoneProperty.title[0].text.content
          : "Sub-item Name Not Available";
  
        const startDateProperty = subItem.properties["Start Date"];
        const startDate = startDateProperty && startDateProperty.date ? startDateProperty.date.start : "Start Date Not Available";
  
        const endDateProperty = subItem.properties["Milestone Deadline"];
        const endDate = endDateProperty && endDateProperty.date ? endDateProperty.date.start : "End Date Not Available";
  
        const progressProperty = subItem.properties["Progress"];
        const progressValue = progressProperty && progressProperty.number ? progressProperty.number : 0;
  
        return {
          id: subitemId,
          name: title,
          actualStart: startDate,
          actualEnd: endDate,
          progressValue: progressValue,
          progress: { fill: "#455a64 0.5", stroke: "0.5 #dd2c00" }
        };
      });

    } catch (error) {
      console.error("Error fetching sub-items:", error);
      return [];
    }
  }
  

  
    const projectsWithSubItems = await Promise.all(projects.map(async page => {

      const projectName = page.properties["Milestone"] && page.properties["Milestone"].title.length > 0
        ? page.properties["Milestone"].title[0].text.content
        : "Project Name Not Available";
        const startDate = page.properties["Start Date"] && page.properties["Start Date"].date
        ? page.properties["Start Date"].date.start || new Date('01-01-2024').toISOString()
        : new Date('01-01-2024').toISOString();
    
    const endDate = page.properties["Milestone Deadline"] && page.properties["Milestone Deadline"].date
        ? page.properties["Milestone Deadline"].date.start || new Date('01-01-2024').toISOString()
        : new Date('01-01-2024').toISOString();

      const children = await getSubItems(page.id)





    return {
      id: page.id,
      name: projectName,
      actualStart: startDate,
      actualEnd: endDate,
      children: children
    };




  }));
  return projectsWithSubItems;
}



// Main function to demonstrate usage
const main = async () => {
  try {
 
    const pages = await fetchProjects();

    // Log the details
    console.log("Pages:", JSON.stringify(pages, null, 2));

    return pages; // Return the array of page details
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
};

// Execute the main function
main();


exports.getDatabase = fetchProjects;
