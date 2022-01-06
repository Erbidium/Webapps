<script context="module">
  export const ssr = false;
</script>

<script>
  import { doQuery } from '$lib/hasura';
  import {
    createClient,
    defaultExchanges,
    subscriptionExchange,
  } from '@urql/core';
  import { createClient as createWSClient } from 'graphql-ws';
  import { setClient, operationStore, subscription } from '@urql/svelte';
  import { Circle3 } from 'svelte-loading-spinners';
  import PopUp from '$lib/header/PopUp.svelte';

  const wsClient = createWSClient({
    url: import.meta.env.VITE_API_WSS_ENDPOINT,
    reconnect: true,
    connectionParams: {
      headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': import.meta.env.VITE_HASURA_ADMIN,
      },
    },
  });

  const client = createClient({
    url: import.meta.env.VITE_API_HTTPS_ENDPOINT,
    exchanges: [
      ...defaultExchanges,
      subscriptionExchange({
        forwardSubscription: operation => ({
          subscribe: sink => ({
            unsubscribe: wsClient.subscribe(operation, sink),
          }),
        }),
      }),
    ],
  });

  const messages = operationStore(`
    subscription MySubscription {
    notes {
      author
      date
      id
      text
    }
  }
  `);

  setClient(client);

  let notes;

  function stateReset() {
    showSpinner = false;
    showSpinnerNotes = false;
    formBtnDisable = false;
  }

  const handleSubscription = (messages = [], dataNotes) => {
    notes = dataNotes.notes;
    stateReset();
    return [dataNotes.notes, ...messages];
  };

  async function startExecuteDeleteNote(_eq) {
    showSpinnerNotes = true;
    formBtnDisable = true;
    disableNote();
    const { errors, data } = await doQuery('deleteNote', { _eq: _eq });

    if (errors) {
      console.error(errors);
      errorHandle(errors);
    }
    notes = data.notes;
    formBtnDisable = false;
    showSpinnerNotes = false;
  }

  async function startFetchMyQuery() {
    errorOccured = false;
    const { errors, data } = await doQuery('getDataQuery');
    if (errors) {
      console.error(errors);
      errorOccured = true;
      errorHandle(errors);
    }
    notes = data.notes;
  }

  async function startExecuteDeleteAllMutation() {
    showSpinnerNotes = true;
    formBtnDisable = true;
    disableNote();

    const { errors, data } = await doQuery('deleteAllMutation');

    if (errors) {
      console.error(errors);
      errorHandle(errors);
    }
    notes = data.notes;
    formBtnDisable = false;
    showSpinnerNotes = false;
  }

  let popUpMessage;

  function errorHandle(errors) {
    stateReset();
    if (
      errors?.message === 'hasura cloud limit of 60 requests/minute exceeded'
    ) {
      popUpMessage = 'Too many requests. Try later';
      setTimeout(() => (popUpMessage = ''), 2000);
      return true;
    }
    popUpMessage = `Server Error ${errors?.message ?? ''}`;
    setTimeout(() => (popUpMessage = ''), 2000);
    return true;
  }

  async function startExecuteCreateNote(date, author, text) {
    const { errors, data } = await doQuery('createNote', {
      date: date,
      author: author,
      text: text,
    });
    if (errors) {
      errorHandle(errors);
      console.error(errors);
    }
    notes = data.notes;
    formBtnDisable = false;
    showSpinnerNotes = false;
  }

  function onDelete(event) {
    const targetElement = event.target;
    startExecuteDeleteNote(targetElement.id).catch(() => errorHandle());
  }

  let inputNote;
  let name;
  let noteText;

  let formBtnDisable = false;

  let showSpinner = false;
  let showSpinnerNotes = false;

  let errorOccured = false;
  let displayValue = 'none';

  function disableNote() {
    displayValue = 'none';
  }

  function typeNote() {
    displayValue = displayValue !== 'none' ? 'none' : 'flex';
  }

  function getDate() {
    let today = new Date();
    return (
      today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
    );
  }
  function createNote() {
    if (name.value.length < 3 || noteText.value.length < 10) {
      popUpMessage =
        'Name should have at least 3 symbols and note should have at least 10 symbols';
      setTimeout(() => (popUpMessage = ''), 4000);
      return;
    }
    showSpinner = true;
    formBtnDisable = true;
    let date = getDate();
    startExecuteCreateNote(date, name.value, noteText.value).catch(() =>
      errorHandle()
    );
    inputNote.reset();
  }

  function deleteAllNotes() {
    startExecuteDeleteAllMutation().catch(() => errorHandle());
  }

  startFetchMyQuery()
    .catch(() => {
      errorHandle();
      errorOccured = true;
    }).finally((() => {
    showSpinnerNotes = false;
    showSpinner = false;
  }));
  subscription(messages, handleSubscription);
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>
<div>
  {#if popUpMessage}
    <PopUp {popUpMessage} />
  {/if}
  {#if errorOccured}
    <p style="color: red">"Sorry! Error occurred"</p>
  {:else if !notes}
    <div style="display: flex;justify-content: center;vertical-align: center;">
      <Circle3 size="60" unit="px" duration="1s" />
    </div>
  {:else}
    <p>Totally notes: {notes.length}</p>
    {#if showSpinner}
      <Circle3 size="60" unit="px" duration="1s" />
    {:else}
      <form style="--display-value: {displayValue}" bind:this={inputNote}>
        <input
          type="text"
          id="author-text"
          name="authorInput"
          maxlength="15"
          placeholder="Input your name"
          bind:this={name}
        />
        <textarea
          id="note-text"
          placeholder="Write note..."
          maxlength="60"
          bind:this={noteText}
        />
        <svg
          id="check-icon"
          on:click={createNote}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-check-circle"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
          />
          <path
            d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"
          />
        </svg>
        <svg
          id="x-icon"
          on:click={typeNote}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-x-circle"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
          />
          <path
            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </form>
      <button class="createNote" on:click={typeNote} disabled={formBtnDisable}>Create note</button>
      <button class="btnDeleteAll" on:click={deleteAllNotes} disabled={formBtnDisable}>Delete all</button>
    {/if}
    {#if showSpinnerNotes}
      <div
        style="display: flex;justify-content: center;vertical-align: center;"
      >
        <Circle3 size="60" unit="px" duration="1s" />
      </div>
    {:else}
      <ul>
        {#each notes as note (note.id)}
          <li>
            <a href="#" class="note">
              <h2><strong>Note</strong></h2>
              <p><strong>Author: {note.author}</strong></p>
              <p><strong>{note.text}</strong></p>
              <p><strong>Date: {note.date}</strong></p>
              <div class="buttonsZone">
                <button
                  class="btnDeleteSpecific"
                  id={note.id}
                  on:click={event => onDelete(event)}
                  disabled={formBtnDisable}>X</button
                >
              </div>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>

<style>
  form {
    display: var(--display-value);
  }
  input {
    width: 100%;
    background-color: transparent;
    border: none;
    font-family: inherit;
    font-size: inherit;
    padding-left: 20px;
    max-width: 100%;
    box-sizing: border-box;
    height: 30px;
  }
  textarea {
    background-color: transparent;
    border: none;
    color: gray;
    font-family: inherit;
    font-size: inherit;
  }
</style>
