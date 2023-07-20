import { _decorator, Component, Enum, instantiate, Node, Prefab, Sprite, UITransform, v3 } from 'cc';
const { ccclass, property } = _decorator;
import { Candy,  } from './candy';
import { CandyColor } from './candy';





// Define the game controller class
@ccclass('GameController')
export class GameController extends Component {
    // The node that contains all the candies
    @property(Node)
    candyContainer: Node = null;

    // The prefab for creating candies
    @property(Prefab)
    candyPrefab: Prefab = null;

    // The number of rows and columns in the grid
    @property
    rows: number = 6;
    
    @property
    cols: number = 6;

    @property({ type: Enum(CandyColor) })

    // The array that stores all the candies in the grid
    candies: Candy[][] = [];

    // The method to initialize the game
    start () {
        // Create a random grid of candies
        this.createRandomGrid();
        // Add mouse events to handle swapping candies
        this.addMouseEvents();
    }

    // The method to create a random grid of candies
    createRandomGrid() {
        // Loop through each row and column
        for (let i = 0; i < this.rows; i++) {
            // Create an empty array for each row
            this.candies[i] = [];
            for (let j = 0; j < this.cols; j++) {
                // Create a new candy node from the prefab
                let candyNode = instantiate(this.candyPrefab);
                // Add the candy node to the candy container node
                this.candyContainer.addChild(candyNode);
                // Get the candy component from the node
                let candy = candyNode.getComponent(Candy);
                // Set a random color for the candy
                candy.setColor(Math.floor(Math.random() * 6));
                // Set the row and column for the candy
                candy.setRowCol(i, j);
                // Store the candy in the array
                this.candies[i][j] = candy;
            }
        }
    }

    // The method to add mouse events to handle swapping candies
    addMouseEvents() {
        // Declare a variable to store the first selected candy
        let firstCandy: Candy = null;
        // Declare a variable to store the second selected candy
        let secondCandy: Candy = null;
        // Add a mouse down event listener to the candy container node
        this.candyContainer.on(Node.EventType.MOUSE_DOWN, (event) => {
            // Get the mouse position in the world coordinate system
            let mousePos = event.getLocation();
            // Convert the mouse position to the local coordinate system of the candy container node
            let localPos = this.candyContainer.getComponent(UITransform).convertToNodeSpaceAR(mousePos);
            // Get the row and column of the grid that corresponds to the mouse position
            let row = Math.floor(-localPos.y / 100);
            let col = Math.floor(localPos.x / 100);
            // Check if the row and column are valid
            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                // Get the candy at the row and column
                let candy = this.candies[row][col];
                // Check if this is the first selected candy
                if (firstCandy == null) {
                    // Set the first selected candy
                    firstCandy = candy;
                    // Scale up the candy node to indicate selection
                    firstCandy.node.scale = v3(1.2,1.2,1.2);
                }
                // Check if this is the second selected candy
                else if (secondCandy == null) {
                    // Set the second selected candy
                    secondCandy = candy;
                    // Scale up the candy node to indicate selection
                    secondCandy.node.scale = v3(1.2,1.2,1.2);
                    // Check if the two candies are adjacent
                    if (this.areAdjacent(firstCandy, secondCandy)) {
                        // Swap the two candies
                        this.swapCandies(firstCandy, secondCandy);
                        // Check if the swap creates any matches
                        if (this.checkMatches()) {
                            // Remove the matched candies and fill the gaps
                            this.removeAndFill();
                        }
                        else {
                            // Swap back the two candies
                            this.swapCandies(firstCandy, secondCandy);
                        }
                    }
                    // Reset the first and second selected candies
                    firstCandy.node.scale = v3(1);
                    secondCandy.node.scale = v3(1);
                    firstCandy = null;
                    secondCandy = null;
                }
            }
        });
    }

    // The method to check if two candies are adjacent
    areAdjacent(candy1: Candy, candy2: Candy): boolean {
        // Get the row and column of the first candy
        let [row1, col1] = candy1.getRowCol();
        // Get the row and column of the second candy
        let [row2, col2] = candy2.getRowCol();
        // Check if they are in the same row and adjacent columns, or in the same column and adjacent rows
        return (row1 == row2 && Math.abs(col1 - col2) == 1) || (col1 == col2 && Math.abs(row1 - row2) == 1);
    }

    // The method to swap two candies
    swapCandies(candy1: Candy, candy2: Candy) {
        // Get the row and column of the first candy
        let [row1, col1] = candy1.getRowCol();
        // Get the row and column of the second candy
        let [row2, col2] = candy2.getRowCol();
        // Swap their positions in the array
        this.candies[row1][col1] = candy2;
        this.candies[row2][col2] = candy1;
        // Swap their positions in the node tree
        candy1.setRowCol(row2, col2);
        candy2.setRowCol(row1, col1);
    }

// The method to check if there are any matches in the grid
checkMatches(): boolean {
    // Loop through each row and column
    for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
            // Get the color of the current candy
            let color = this.candies[i][j].getColor();
            // Check if there are at least three candies with the same color horizontally or vertically
            if ((this.matchColor(i, j, color, 0, 1) >= 3) || 
                (this.matchColor(i, j, color, 1, 0) >= 3)) {
                // Return true if there is a match
                return true;
            }
        }
    }
    // Return false if there is no match
    return false;
}

// The method to count how many candies have the same color in a given direction
matchColor(row: number, col: number, color: CandyColor, rowDir: number, colDir: number): number {
    // Initialize the count to 1
    let count = 1;
    // Loop while the row and column are valid and the color matches
    while (row >= 0 && row < this.rows && col >= 0 && col < this.cols && this.candies[row][col].getColor() == color) {
        // Increment the count
        count++;
        // Move to the next candy in the direction
        row += rowDir;
        col += colDir;
    }
    // Return the count
    return count;
}


removeAndFill() {
    // Declare an array to store the candies that need to be removed
    let candiesToRemove: Candy[] = [];
    // Loop through each row and column
    for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
            // Get the color of the current candy
            let color = this.candies[i][j].getColor();
            // Check if there are at least three candies with the same color horizontally or vertically
            if ((this.matchColor(i, j, color, 0, 1) >= 3) || 
                (this.matchColor(i, j, color, 1, 0) >= 3)) {
                // Add the candy to the array
                candiesToRemove.push(this.candies[i][j]);
            }
        }
    }
    // Loop through each candy in the array
    for (let candy of candiesToRemove) {
        // Get the row and column of the candy
        let [row, col] = candy.getRowCol();
        // Remove the candy from the array
        this.candies[row][col] = null;
        // Remove the candy from the node tree
        candy.node.destroy();
    }
    // Loop through each column
    for (let j = 0; j < this.cols; j++) {
        // Declare a variable to store the number of empty spaces in the column
        let emptySpaces = 0;
        // Loop through each row from bottom to top
        for (let i = this.rows - 1; i >= 0; i--) {
            // Check if there is no candy in the cell
            if (this.candies[i][j] == null) {
                // Increment the empty spaces
                emptySpaces++;
            }
            else {
                // Check if there are any empty spaces below the candy
                if (emptySpaces > 0) {
                    // Get the candy in the cell
                    let candy = this.candies[i][j];
                    // Move the candy down by the number of empty spaces
                    candy.setRowCol(i + emptySpaces, j);
                    // Update the array accordingly
                    this.candies[i + emptySpaces][j] = candy;
                    this.candies[i][j] = null;
                }
            }
        }
        // Loop through each empty space from top to bottom
        for (let i = 0; i < emptySpaces; i++) {
            // Create a new candy node from the prefab
            let candyNode = instantiate(this.candyPrefab);
            // Add the candy node to the candy container node
            this.candyContainer.addChild(candyNode);
            // Get the candy component from the node
            let candy = candyNode.getComponent(Candy);
            // Set a random color for the candy
            candy.setColor(Math.floor(Math.random() * 6));
            // Set the row and column for the candy
            candy.setRowCol(i, j);
            // Store the candy in the array
            this.candies[i][j] = candy;
        }
    }
}



}
