const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");





//  const location = path.join(__dirname,"./public");

// app.use(express.static(location));
//app.set("view engine", "hbs")


//show sidebar
menuBtn.addEventListener('click',() =>
{
    sideMenu.style.display='block'; 
})

//close sidebar
closeBtn.addEventListener('click',() =>{
    sideMenu.style.display='none';
})


//change theme
themeToggler.addEventListener('click',() =>
{
    document.body.classList.toggle('dark-theme-variables');

    themeToggler.querySelector('span:nth-child(1)').
    classList.toggle('active');
    themeToggler.querySelector('span:nth-child(2)').
    classList.toggle('active');
})



function updateText() {
    const textElement = document.getElementById('timeDateText');
    const currentTime = new Date();
    
    const options = { month: 'long',day: 'numeric', year: 'numeric',  hour: 'numeric', minute: 'numeric', second: 'numeric' };
    //const day = {weekday: 'long'} 
    const formattedDay = currentTime.toLocaleDateString('en-US')
    const formattedTime = currentTime.toLocaleDateString('en-US',options);
    textElement.textContent = formattedDay+ '\n' +formattedTime;
}  


//////////////////////////////////////////////////////////////////////


document.addEventListener('DOMContentLoaded', function () {
    const taskBtn = document.querySelector('.task-btn');
    const taskDropdown = document.querySelector('.task-dropdown');
    let isDropdownOpen = false;

    // Function to toggle task dropdown
    taskBtn.addEventListener('click', function (event) {
        event.preventDefault();
        isDropdownOpen = !isDropdownOpen;
        if (isDropdownOpen) {
            taskDropdown.style.display = 'block';
        } else {
            taskDropdown.style.display = 'none';
        }
    });

    // Close the task dropdown when clicking anywhere else
    document.addEventListener('click', function (event) {
        if (isDropdownOpen && !event.target.closest('.task-dropdown') && !event.target.closest('.task-btn')) {
            taskDropdown.style.display = 'none';
            isDropdownOpen = false;
        }
    });
});



//  selection highlight in the side bar 
document.addEventListener('DOMContentLoaded', function () {
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    let selectedLink = null;

    // Function to handle link click
    function handleLinkClick(event) {
        if (selectedLink) {
            selectedLink.classList.remove('active');
        }
        event.currentTarget.classList.add('active');
        selectedLink = event.currentTarget;
    }

    // Add click event listener to each sidebar link
    sidebarLinks.forEach(function (link) {
        link.addEventListener('click', handleLinkClick);
    });
});


////////////////////////////////////////////logout logic//////////
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.querySelector('.logout');

    // Function to handle logout
    function logout() {
        // Here, you can perform logout actions like clearing the session or token.
        // For example, if using localStorage for authentication token:
        localStorage.removeItem('authToken'); // Remove the authentication token

        // Redirect to the login page
        window.location.href = '/'; // Replace '/login' with your login page URL
    }

    // Attach the logout function to the logout button click event
    logoutButton.addEventListener('click', function (event) {
        event.preventDefault();
        logout(); // Call the logout function when the button is clicked
    });
});






 /////////////////////////////////////////////////////////
 document.addEventListener('DOMContentLoaded', function() {
    const addTaskLink = document.getElementById('add-task-link');

    if (addTaskLink) {
        addTaskLink.addEventListener('click', function(event) {
            event.preventDefault();
            // Redirect to the "Add New Task" page
            window.location.href = '/sideinput';
        });
    }
});




/////////////////////////////////date////////////////////////////////////

    
    document.addEventListener('DOMContentLoaded', function () {
        // Get the current date
        var currentDate = new Date();

        // Get day, month, and year components
        var day = currentDate.getDate();
        var monthIndex = currentDate.getMonth(); // 0-based index
        var year = currentDate.getFullYear();

        // Array to map month index to month names
        var monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Create a string with the current date format
        var dateString = day + " " + monthNames[monthIndex] + " " + year;

        // Display the formatted date in the designated div
        var currentDateElement = document.getElementById('current-date');
        currentDateElement.textContent = dateString;
    });


//////////////////////////////////////day/////////////////////////////////////////////////
  document.addEventListener('DOMContentLoaded', function () {
        // Define an array to map day indices to day names
        var dayNames = [
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ];

        // Get the current date
        var currentDate = new Date();

        // Get the day index (0 to 6, where 0 is Sunday, 1 is Monday, etc.)
        var dayIndex = currentDate.getDay();

        // Get the day name from the array using the day index
        var currentDay = dayNames[dayIndex];

        // Display the current day in the designated div
        var currentDayElement = document.getElementById('current-day');
        currentDayElement.textContent = currentDay;
    });

    
      

    /////////////////////////////////signin logic////////////////////////////////////////////////
    function updateClock() {
        // ... (Existing code to display the live timer)
         var currentTime = new Date();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();

        // Format the time components to always have two digits
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }


        // Display the formatted time in the designated div
        var timerElement = document.getElementById('live-timer');
        timerElement.textContent = hours + " : " + minutes + " : " + seconds;
    }

    // Update the clock every second (1000 milliseconds)
    setInterval(updateClock, 1000);

    // Run the initial update
    updateClock();

    document.addEventListener("DOMContentLoaded", function () {
        // Get a reference to the sign-in button
        const signInButton = document.getElementById("sign-in-button");
    
        // Add a click event listener to the sign-in button
        signInButton.addEventListener("click", function () {
            // Get the current date and time
            //const signInTime = new Date().toISOString();
        
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const hours = String(currentDate.getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');
            const seconds = String(currentDate.getSeconds()).padStart(2, '0');
            
            const signInTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            // Send the sign-in time to the server using an HTTP request (e.g., fetch)
            fetch("/signin", { // Updated endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ signInTime }),
            })
            .then((response) => response.json())
            .then((data) => {
                // Handle the response from the server if needed
                console.log("Sign-in time sent to the server successfully.");
            })
            .catch((error) => {
                console.error("Error sending sign-in time to the server:", error);
            });
        });
    });
  
    