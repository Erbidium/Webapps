<script context="module">
  export const ssr = false;
</script>

<script>
  import { doQuery } from '$lib/hasura';
  import { Circle3 } from 'svelte-loading-spinners';
  import { onMount } from 'svelte';
  import PopUp from '$lib/header/PopUp.svelte';
  import auth from '../authService';
  import { isAuthenticated, user, token, offline, popUpMessage } from '../store';


  let notes;

  function stateReset() {
    showSpinner = false;
    showSpinnerNotes = false;
    formBtnDisable = false;
  }

  async function startExecuteDeleteNote(_eq) {
    showSpinnerNotes = true;
    formBtnDisable = true;
    disableNote();
    const { errors, data } = await doQuery('deleteNote', { _eq: _eq });

    if (errors) {
      console.error(errors);
      errorHandle(errors);
    }
    startFetchMyQuery()
      .then(() => {
        formBtnDisable = false;
        showSpinnerNotes = false;
      })
      .catch(() => errorHandle());
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
    startFetchMyQuery()
      .then(() => {
        formBtnDisable = false;
        showSpinnerNotes = false;
      })
      .catch(() => errorHandle());
  }

  token.subscribe(async(tokenValue) => {
    if(tokenValue!=='') {
      startFetchMyQuery()
        .catch(() => errorHandle())
        .finally(() => {
          formBtnDisable = false;
          showSpinnerNotes = false;
        });
    }
  })

  function errorHandle(errors) {
    stateReset();
    if (
      errors?.message === 'hasura cloud limit of 60 requests/minute exceeded'
    ) {
      $popUpMessage = 'Too many requests. Try later';
      setTimeout(() => ($popUpMessage = ''), 2000);
      return true;
    }
    $popUpMessage = `Server Error ${errors?.message ?? ''}`;
    setTimeout(() => ($popUpMessage = ''), 2000);
    return true;
  }

  async function startExecuteCreateNote(name, text) {
    const { errors, data } = await doQuery('createNote', {
      name: name,
      text: text
    });
    if (errors) {
      errorHandle(errors);
      console.error(errors);
    }
    startFetchMyQuery()
      .then(() => {
        formBtnDisable = false;
        showSpinner = false;
      })
      .catch(() => errorHandle());
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

  function createNote() {
    if (name.value.length < 3 || noteText.value.length < 10) {
      $popUpMessage = 'Name should have at least 3 symbols and note should have at least 10 symbols';
      setTimeout(() => ($popUpMessage = ''), 4000);
      return;
    }
    showSpinner = true;
    formBtnDisable = true;
    startExecuteCreateNote(name.value, noteText.value).catch(() =>
      errorHandle()
    );
    inputNote.reset();
  }

  function deleteAllNotes() {
    startExecuteDeleteAllMutation().catch(() => errorHandle());
  }

  let authClient;
  onMount(async () => {
    authClient = await auth.createClient();
    isAuthenticated.set(await authClient.isAuthenticated());
    const accessToken = await authClient.getIdTokenClaims();
    if(accessToken)
    {
      token.set(accessToken.__raw);
    }
    user.set(await authClient.getUser());
  });

  function login() {
    auth.loginWithPopup(authClient);
  }

  function logout() {
    auth.logout(authClient);
  }

  window.onoffline = () => {
    offline.set(true);
  };
  window.ononline = () => {
    offline.set(false);
  };
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>
<div>
  {#if $popUpMessage && !$offline}
    <PopUp/>
  {/if}
  {#if $offline}
    <p style="color: var(--error-color)">"No internet connection!"</p>
  {:else if !authClient}
    <div style="display: flex;justify-content: center;vertical-align: center;">
      <Circle3 size="60" unit="px" duration="1s" />
    </div>
  {:else if $isAuthenticated}
    {#if errorOccured}
      <p style="color: var(--error-color)">"Sorry! Error occurred"</p>
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
            id="name-text"
            name="nameInput"
            maxlength="15"
            placeholder="Input note name"
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
        <button class="btnLogOut" on:click={logout} disabled={formBtnDisable}>Log out</button>
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
                <p><strong>Name: {note.name}</strong></p>
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
  {:else}
    <p>You should login to use application</p>
    <button class='btnLogIn' on:click={login}>Log in</button>
  {/if}
</div>

<style>
  :root {
      --error-color: red;
  }
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
