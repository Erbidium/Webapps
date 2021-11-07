<script context="module">
  export const prerender = true;
</script>

<script>
  import { Jumper } from 'svelte-loading-spinners';

  let form = {
    reset: () => {},
  };
  let errorText = '';
  let showSpinner = false;
  let statusMessage = false;
  let errorMessage = false;
  let formBtnDisable = false;
  function resetFormStatus() {
    statusMessage = false;
    errorMessage = false;
    formBtnDisable = false;
  }
  let contactFormHandler = async e => {
    statusMessage = false;
    errorMessage = false;
    formBtnDisable = true;
    showSpinner = true;

    let formData = {};
    Array.from(form.elements).forEach(element => {
      const key = element.name;
      formData[key] = element.value;
    });
    formData['referrer'] = document.referrer;
    try {
      await fetch('/api/sendMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }).then(res => {
        if (res.ok) {
          return res;
        }
        throw res;
      });
      statusMessage = true;
      form.reset();
    } catch (e) {
      if (e.status >= 500) {
        errorText = 'Server error';
      } else if (e.status === 400) {
        errorText = 'Empty email message!';
      } else if (e.status === 429) {
        errorText = 'You sent mail too many times';
      }
      errorMessage = true;
      console.log(e);
    } finally {
      showSpinner = false;
    }
  };
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <h1>Please, fill form</h1>
  <form
    class="contact-form"
    bind:this={form}
    on:submit|preventDefault={contactFormHandler}
  >
    <input
      class="contact-form-input"
      type="text"
      name="userName"
      placeholder="Name"
      required
    />
    <input
      class="contact-form-input"
      type="email"
      name="userEmail"
      placeholder="Email"
      required
    />
    <textarea
      class="contact-form-message"
      name="userMessage"
      cols="30"
      rows="10"
      placeholder="Message text"
      required
    />
    {#if statusMessage}
      <p class="status-text success">
        Message sent!
        <button class="button class-btn" on:click={resetFormStatus}>
          &times;
        </button>
      </p>
    {:else if errorMessage}
      <p class="status-text error">
        {errorText}
        <button class="button class-btn" on:click={resetFormStatus}>
          &times;
        </button>
      </p>
    {/if}

    <button
      class="button contact-form-button"
      type="submit"
      disabled={formBtnDisable}
    >
      {#if showSpinner}
        <Jumper size="60" color="#FF3E00" unit="px" duration="1s" />
      {/if}
      Submit
    </button>
  </form>
</section>
