<script>

  import {onMount} from "svelte";
  async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(
            "https://lab3todo.herokuapp.com/v1/graphql",
            {
              method: "POST",
              body: JSON.stringify({
                query: operationsDoc,
                variables: variables,
                operationName: operationName
              })
            }
    );
    return result.json();
  }

  const operationsDoc = `
  mutation deleteAllMutation {
    delete_notes(where: {}) {
      affected_rows
    }
  }
  query getDataQuery {
    notes {
      author
      date
      text
      id
    }
  }
  mutation deleteNote($_eq: uuid) {
    delete_notes(where: {id: {_eq: $_eq}}) {
      affected_rows
    }
  }
  mutation createNote($date: date = "", $author: String = "", $text: String = "") {
    insert_notes(objects: {author: $author, date: $date, text: $text}){
      affected_rows
    }
  }
`;

  function fetchMyQuery() {
    return fetchGraphQL(
            operationsDoc,
            "getDataQuery",
            {}
    );
  }

  function executeDeleteAllMutation() {
    return fetchGraphQL(
            operationsDoc,
            "deleteAllMutation",
            {}
    );
  }

  function executeDeleteNote(_eq) {
    return fetchGraphQL(
            operationsDoc,
            "deleteNote",
            {"_eq": _eq}
    );
  }

  function executeCreateNote(date, author, text) {
    return fetchGraphQL(
            operationsDoc,
            "createNote",
            {"date": date, "author": author, "text": text}
    );
  }

  async function startExecuteDeleteNote(_eq) {
    const {errors, data} = await executeDeleteNote(_eq);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
    }
    await startFetchMyQuery();
  }


  async function startFetchMyQuery() {
    const { errors, data } = await fetchMyQuery();
    errorOccured=false;
    if (errors) {
      // handle those errors like a pro
      console.error(errors);
      error=errors;
      errorOccured=true;
    }
    notes=data.notes;
    console.log(notes);

    // do something great with this precious data
    console.log(data);
  }
  async function startExecuteDeleteAllMutation() {
    const { errors, data } = await executeDeleteAllMutation();

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
    }
    await startFetchMyQuery();
    console.log("Hello");
    // do something great with this precious data
    console.log(data);
  }

  async function startExecuteCreateNote(date, author, text) {
    const { errors, data } = await executeCreateNote(date, author, text);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
    }
    await startFetchMyQuery();
    // do something great with this precious data
    console.log(data);
  }

  function onDelete (event) {
    const targetElement = event.target;
    startExecuteDeleteNote(targetElement.id);
  }
  let checkIcon;
  let xIcon;
  let inputNote;
  let isDisabled="visible";
  let errorOccured =false;
  let error;

  function typeNote()
  {
    if(isDisabled==="hidden")
    {
      inputNote.visible=false;
      isDisabled="visible";
    }
    else {
      inputNote.visible=true;
      isDisabled="visible";
    }
    console.log(xIcon);
    console.log("Rejected!");

  }
  function createNote()
  {
    console.log(checkIcon);
    console.log("Note is created!");
    startExecuteCreateNote("2021-11-21", "dimas", "hello");
  }
  let notes;
  onMount(async()=>{
    await startFetchMyQuery()
  })

</script>

<svelte:head>
  <title>Home</title>

</svelte:head>

<div>
  {#if !notes}
    <p>...waiting</p>
  {:else if errorOccured===true}
    <p style="color: red">{error}</p>
  {:else}
    <p>Totally notes: {notes.length}</p>
    <form>
      <textarea id="note-text" bind:this={inputNote} placeholder="Write note..." maxlength="96">

      </textarea>
      <svg bind:this={checkIcon} on:click={createNote} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
      </svg>
      <svg bind:this={xIcon} on:click={typeNote} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>
    </form>
    <button class="createNote" on:click={typeNote}>Create note</button>
    <button class="btnDeleteAll" on:click={startExecuteDeleteAllMutation} >Delete all</button>
    <ul>
      {#each notes as {author, date,  text, id}}
        <li>
          <a href="#" class="note">
            <h2><strong>Note</strong></h2>
            <p><strong>Author: {author}</strong></p>
            <p><strong>{text}</strong></p>
            <p><strong>Date: {date}</strong></p>
            <div class="buttonsZone">
              <button class="btnEditSpecific">&#9998</button>
              <button class="btnDeleteSpecific" id="{id}" on:click={event => onDelete(event)}>X</button>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
