import { useEffect, useState } from "react";
import "./App.css";
import List from "./List";
import { DragDropContext } from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { apiToken } from "./const";

function App() {
  const [lists, setLists] = useState({
    "To Do": JSON.parse(localStorage.getItem("To Do")) || [],
    "In Progress": JSON.parse(localStorage.getItem("In Progress")) || [],
    "In Revision": JSON.parse(localStorage.getItem("In Revision")) || [],
    Done: JSON.parse(localStorage.getItem("Done")) || [],
  });

  useEffect(() => {
    fetch("https://oprec-api.labse.in/api/task", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiToken,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const ToDo = data.data.tasks.filter((task) => task.status === "To Do");
        const InProgress = data.data.tasks.filter(
          (task) => task.status === "In Progress"
        );
        const InRevision = data.data.tasks.filter(
          (task) => task.status === "In Revision"
        );
        const Done = data.data.tasks.filter((task) => task.status === "Done");
        setLists({
          "To Do": ToDo,
          "In Progress": InProgress,
          "In Revision": InRevision,
          Done: Done,
        });
      });
  }, []);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }
    const sourceList = [...lists[source.droppableId]];
    const card = sourceList[source.index];

    sourceList.splice(source.index, 1);

    const destinationList = [...lists[destination.droppableId]];

    destinationList.splice(destination.index, 0, card);

    const newLists = {
      ...lists,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destinationList,
    };

    setLists(newLists);

    fetch("https://oprec-api.labse.in/api/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiToken,
      },
      body: JSON.stringify({
        title: card.title,
        description: card.description,
        status: destination.droppableId,
        dueDate: card.dueDate,
        tags: card.tags,
      }),
    })
      .then(() => {
        fetch(`https://oprec-api.labse.in/api/task/${card._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: apiToken,
          },
        });
      })
      .catch(() => toast.error("Failed to add task"));
  };

  return (
    <main>
      <div className="blocks">
        <div className="blocks-title">
          <h1>SHAV</h1>
          <h2>Project Management App</h2>
        </div>
        <div className="blocks-list">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="blocks-lists">
              <List
                title="To Do"
                className="rounded-left"
                data={lists["To Do"]}
              />
              <List title="In Progress" data={lists["In Progress"]} />
              <List title="In Revision" data={lists["In Revision"]} />
              <List
                title="Done"
                className="rounded-right"
                data={lists["Done"]}
              />
            </div>
          </DragDropContext>
        </div>
      </div>
      <div className="footer">
        <p className="footer-text">Farrell Matthew Lim - 5025221258</p>
      </div>
    </main>
  );
}

export default App;
