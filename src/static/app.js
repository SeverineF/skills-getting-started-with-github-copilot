document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = `<option value="">-- Select an activity --</option>`;

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

      const participantsSection = document.createElement("div");
      participantsSection.className = "participants-section";
      participantsSection.innerHTML = `<p><strong>Participants:</strong></p>`;

      if (details.participants.length) {
        const participantList = document.createElement("ul");
        participantList.className = "participants-list";

        details.participants.forEach((participant) => {
          const participantItem = document.createElement("li");
          participantItem.className = "participant-item";

          const participantName = document.createElement("span");
          participantName.textContent = participant;

          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "participant-remove";
          removeButton.title = `Unregister ${participant}`;
          removeButton.textContent = "×";

          removeButton.addEventListener("click", async () => {
            try {
              const response = await fetch(
                `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(participant)}`,
                { method: "DELETE" }
              );
              const result = await response.json();

              if (response.ok) {
                showMessage(result.message, "success");
                fetchActivities();
              } else {
                showMessage(result.detail || "Unable to remove participant", "error");
              }
            } catch (error) {
              showMessage("Failed to unregister participant. Please try again.", "error");
              console.error("Error unregistering participant:", error);
            }
          });

          participantItem.append(participantName, removeButton);
          participantList.appendChild(participantItem);
        });

        participantsSection.appendChild(participantList);
      } else {
        const noParticipants = document.createElement("p");
        noParticipants.className = "no-participants";
        noParticipants.textContent = "No participants yet.";
        participantsSection.appendChild(noParticipants);
      }

      activityCard.appendChild(participantsSection);

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
      activitiesList.appendChild(activityCard);
    });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
