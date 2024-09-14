// Function to handle when the target element is in view
function onElementInView(callback: () => void) {
  return (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver,
  ) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Execute the callback function when the element is in view
        callback();
        // Stop observing if you only want it to fire once
        observer.unobserve(entry.target);
      }
    });
  };
}

export const setViewLogic = (domElementId: string, callback: () => void) => {
  const targetElement = document.getElementById(domElementId);

  if (targetElement) {
    // Create the observer with the callback
    const observer = new IntersectionObserver(
      onElementInView(() => {
        // Your custom callback logic here
        console.log(domElementId, "element has scrolled into view!");
        callback();
      }),
      {
        threshold: 0.5, // Adjust threshold based on when you want the event to fire
      },
    );

    // Start observing the target element
    observer.observe(targetElement);
  } else {
    console.error("Target element not found.");
  }
};
