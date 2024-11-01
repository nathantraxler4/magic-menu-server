function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function getMenus() {
    console.log("Getting menus");
    await delay(2000);
    const menu = [{
            courses: [
                {
                    name: "Course 1",
                    description: "This is a yummy course."
                },
                {
                    name: "Course 2",
                    description: "This is also a yummy course."
                },
                {
                    name: "Course 3",
                    description: "This might be a yummy dessert course."
                }
            ],
            backgroundImage: 1
        }];
    return menu;
}
export async function generateMenu(recipes) {
    console.log("Generating menu");
    await delay(2000);
    const menu = {
        courses: [
            {
                name: "Course 1",
                description: "This is a yummy course."
            },
            {
                name: "Course 2",
                description: "This is also a yummy course."
            },
            {
                name: "Course 3",
                description: "This might be a yummy dessert course."
            }
        ],
        backgroundImage: 1
    };
    return menu;
}
