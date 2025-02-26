// ---------------------
// DRAG AND DROP FUNCTIONALITY
// ---------------------

// We'll store the currently dragged row ID here
let draggedRowId = null;

// DRAG START: Save the row ID when dragging begins
document.querySelectorAll('.puzzle-row[draggable="true"]').forEach(row => {
  row.addEventListener('dragstart', (event) => {
    draggedRowId = event.target.id;
    event.dataTransfer.effectAllowed = 'move';
  });
});

// DRAG OVER & DRAG ENTER: Allow drop and add a visual highlight
document.querySelectorAll('.puzzle-row[draggable="true"]').forEach(row => {
  row.addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  row.addEventListener('dragenter', (event) => {
    event.preventDefault();
    event.target.classList.add('drag-over');
  });
  row.addEventListener('dragleave', (event) => {
    event.target.classList.remove('drag-over');
  });
});

// DROP: Swap the positions of the dragged row and the drop target
document.querySelectorAll('.puzzle-row[draggable="true"]').forEach(row => {
  row.addEventListener('drop', (event) => {
    event.preventDefault();
    event.target.classList.remove('drag-over');

    const droppedOnRowId = event.target.id;
    if (!draggedRowId || draggedRowId === droppedOnRowId) return;

    const puzzleContainer = document.querySelector('.puzzle-container');
    const draggedRow = document.getElementById(draggedRowId);
    const droppedOnRow = document.getElementById(droppedOnRowId);

    swapElements(puzzleContainer, draggedRow, droppedOnRow);

    draggedRowId = null; // reset
  });
});

// Helper function to swap two elements within the same parent
function swapElements(parent, el1, el2) {
  const temp = document.createElement('div');
  parent.insertBefore(temp, el1);
  parent.insertBefore(el1, el2);
  parent.insertBefore(el2, temp);
  parent.removeChild(temp);
}

// ---------------------
// UNDERLINE / HINT / REVEAL FUNCTIONALITY
// ---------------------

// On page load, initialize each middle row with underscores corresponding to its solution length
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.puzzle-row[draggable="true"]').forEach(row => {
    const solution = row.getAttribute('data-solution');
    if (solution) {
      // Initialize a "user input" state as underscores
      const initialGuess = '_'.repeat(solution.length);
      row.setAttribute('data-user-input', initialGuess);
      updateRowDisplay(row);
    }
  });
});

// Function to update the displayed text for a row based on the "user input"
function updateRowDisplay(row) {
  const solution = row.getAttribute('data-solution');
  const userInput = row.getAttribute('data-user-input');
  let displayText = '';

  // Build display: show correct letters; use underscores for the rest
  for (let i = 0; i < solution.length; i++) {
    if (userInput[i] === solution[i]) {
      displayText += solution[i] + ' ';
    } else {
      displayText += '_ ';
    }
  }
  
  // If the user input exactly matches the solution, remove the extra spaces
  if (userInput === solution) {
    displayText = solution;
  }
  
  row.textContent = displayText;
}

// ---------------------
// BUTTON FUNCTIONALITY
// ---------------------

// Track the currently selected row
let selectedRow = null;

// Allow the user to select a row by clicking
document.querySelectorAll('.puzzle-row[draggable="true"]').forEach(row => {
  row.addEventListener('click', () => {
    // Remove highlight from any previously selected row
    if (selectedRow) {
      selectedRow.classList.remove('selected');
    }
    selectedRow = row;
    row.classList.add('selected');
  });
});

// When the "Hint" button is clicked, reveal one letter (the first unrevealed one)
document.getElementById('hint-button').addEventListener('click', () => {
  if (!selectedRow) {
    alert('Please select a row first!');
    return;
  }
  const solution = selectedRow.getAttribute('data-solution');
  let userInput = selectedRow.getAttribute('data-user-input');
  
  // Find the first underscore position
  let indexToReveal = userInput.indexOf('_');
  if (indexToReveal === -1) {
    // All letters already revealed
    return;
  }
  
  // Update the user input with the correct letter at that position
  let newUserInput = userInput.substring(0, indexToReveal) +
                     solution[indexToReveal] +
                     userInput.substring(indexToReveal + 1);
  selectedRow.setAttribute('data-user-input', newUserInput);
  updateRowDisplay(selectedRow);
});

// When the "Reveal" button is clicked, reveal the full solution
document.getElementById('reveal-button').addEventListener('click', () => {
  if (!selectedRow) {
    alert('Please select a row first!');
    return;
  }
  const solution = selectedRow.getAttribute('data-solution');
  selectedRow.setAttribute('data-user-input', solution);
  updateRowDisplay(selectedRow);
});

async function generateNewPuzzle() {
    try {
      // 1. Fetch puzzle data
      const response = await fetch('/generate_puzzle');
      const puzzleData = await response.json();
  
      // 2. Extract words and clues
      const { words, clues } = puzzleData;
  
      // 3. Populate the middle rows
      // Select all the middle rows (we assume they have IDs row-1, row-2, row-3, row-4, row-5)
      for (let i = 0; i < 5; i++) {
        const rowId = `row-${i + 1}`;
        const rowElement = document.getElementById(rowId);
        if (rowElement) {
          const word = words[i];
          const clue = clues[i];
  
          // Set the row's data-solution
          rowElement.setAttribute('data-solution', word);
  
          // Optionally store the clue as well
          rowElement.setAttribute('data-clue', clue);
  
          // Reset user input to underscores
          // e.g., "_____"
          const underscoreString = '_'.repeat(word.length);
          rowElement.setAttribute('data-user-input', underscoreString);
  
          // Update the display (so underscores show up)
          updateRowDisplay(rowElement);
        }
      }
  
      // (Optional) If you have a place to show the top & bottom words or other puzzle elements,
      // you can do so here. For now, let's keep them locked until the middle is solved.
  
      alert('New puzzle generated!');
    } catch (error) {
      console.error('Error generating puzzle:', error);
      alert('Failed to generate puzzle. See console for details.');
    }
  }

  document.getElementById('generate-button').addEventListener('click', generateNewPuzzle);
