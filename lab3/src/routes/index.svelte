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
  import { popUpMessage } from '../store';

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
    notes(order_by: {date: desc, time: desc}) {
      author
      date
      id
      text
    }
  }
  `);

  setClient(client);

  let notes;
  let noteActive = false;

  function stateReset() {
    showSpinnerNotes = formBtnDisable = false;
  }

  const handleSubscription = (messages = [], dataNotes) => {
    notes = dataNotes.notes;
    stateReset();
    return [dataNotes.notes, ...messages];
  };

  async function startExecuteDeleteNote(_eq) {
    showSpinnerNotes = formBtnDisable = true;
    disableNote();
    const { errors, data } = await doQuery('deleteNote', { _eq: _eq });
    if (errors) {
      throw errors;
    }
    notes.splice(notes.findIndex(note => note.id === _eq), 1);
  }

  async function startFetchMyQuery() {
    errorOccured = false;
    const { errors, data } = await doQuery('getDataQuery');
    if (errors) {
      throw errors;
    }
    notes = data.notes;
  }

  async function startExecuteDeleteAllMutation() {
    showSpinnerNotes = formBtnDisable = true;
    disableNote();

    const { errors, data } = await doQuery('deleteAllMutation');
    if (errors) {
      throw errors;
    }
    notes = [];
  }

  function errorHandle(errors) {
    stateReset();
    if (
      errors?.message === 'hasura cloud limit of 60 requests/minute exceeded'
    ) {
      $popUpMessage = 'Too many requests. Try later';
      return true;
    }
    $popUpMessage = `Server Error ${errors?.message ?? ''}`;
    return true;
  }

  async function startExecuteCreateNote(author, text) {
    formBtnDisable = showSpinnerNotes = true;
    disableNote();

    const { errors, data } = await doQuery('createNote', {
      author: author,
      text: text,
    });
    if (errors) {
      throw errors;
    }
    note = {};
    notes.unshift(data.insert_notes.returning[0]);
  }

  function onDelete(event) {
    startExecuteDeleteNote(event.target.dataset.id)
      .catch(errorHandle)
      .finally(stateReset);
  }

  let note = {};

  let formBtnDisable = false;

  let showSpinnerNotes = false;

  let errorOccured = false;

  function disableNote() {
    noteActive = formBtnDisable = false;
  }
  function displayNote() {
    noteActive = formBtnDisable = true;
  }
  function createNote() {
    if (note.name.length < 3 || note.text.length < 10) {
      $popUpMessage = 'Name should have at least 3 symbols and note should have at least 10 symbols';
      return;
    }
    startExecuteCreateNote(note.name, note.text)
      .catch(() => {
        errorHandle();
        displayNote();
      }).finally(stateReset);
  }

  function deleteAllNotes() {
    startExecuteDeleteAllMutation()
      .catch(errorHandle)
      .finally(stateReset);
  }

  startFetchMyQuery()
    .catch(() => {
      errorHandle();
      errorOccured = true;
    }).finally((() => {
    showSpinnerNotes = false;
  }));
  subscription(messages, handleSubscription);
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

{#if $popUpMessage}
  <PopUp/>
{/if}
{#if errorOccured}
  <p class="error-text">"Sorry! Error occurred"</p>
{:else}
  {#if !notes || showSpinnerNotes}
    <div class="spinner-wrap">
      <Circle3 size="60" unit="px" duration="1s" />
    </div>
  {/if}
  <div class:notVisible={!notes || showSpinnerNotes}>
    <p>Totally notes: {notes?.length ?? 0}</p>
    <form class:activated={noteActive}>
      <input
        type="text"
        name="authorInput"
        maxlength="15"
        placeholder="Input your name"
        bind:value={note.name}
      />
      <textarea
        name="noteText"
        placeholder="Write note..."
        maxlength="60"
        bind:value={note.text}
      />
      <svg
        class="check-icon"
        on:click={createNote}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
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
        class="x-icon"
        on:click={disableNote}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
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
    <button class="createNote" on:click={displayNote} class:no-hover={formBtnDisable} disabled={formBtnDisable} >Create note</button>
    <button class="btnDeleteAll" on:click={deleteAllNotes} class:no-hover={formBtnDisable} disabled={formBtnDisable}>Delete all</button>
    <ul>
      {#each (notes ?? []) as note (note.id)}
        <li>
          <a href="#" class="note" class:no-hover={formBtnDisable}>
            <h2><strong>Note</strong></h2>
            <p><strong>Author: {note.author}</strong></p>
            <p><strong>{note.text}</strong></p>
            <p><strong>Date: {note.date}</strong></p>
            <div class="buttonsZone">
              <button
                class="btnDeleteSpecific"
                data-id={note.id}
                on:click={onDelete}
                class:no-hover={formBtnDisable}
                disabled={formBtnDisable}>X</button
              >
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </div>
{/if}
<style>
  :root {
    --error-color: red;
    --bg-color: transparent;
    --textarea-color: gray;
  }
  form {
    display: none;
  }
  .activated {
      display: flex;
  }
  input {
    width: 100%;
    background-color: var(--bg-color);
    border: none;
    font-family: inherit;
    font-size: inherit;
    padding-left: 20px;
    max-width: 100%;
    box-sizing: border-box;
    height: 30px;
  }
  textarea {
    background-color: var(--bg-color);
    border: none;
    color: var(--textarea-color);
    font-family: inherit;
    font-size: inherit;
  }
  .spinner-wrap {
    display: flex;
    justify-content: center;
    vertical-align: center;
    position: fixed;
    width:100%;
    height: 100%;
    z-index: 2;
  }
  .notVisible {
    visibility: hidden;
  }
  .error-text {
    color: var(--error-color);
  }
  .no-hover{
      pointer-events: none;
  }
</style>
