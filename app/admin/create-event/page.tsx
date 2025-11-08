import CreateEventForm from "@/components/forms/create-event-form";

const CreateEventPage = () => {
  return (
    <section>
      <h1 className="text-center font-semibold">Create an Event</h1>

      <div id="create-event" className="mt-8">
        <CreateEventForm />
      </div>
    </section>
  );
};

export default CreateEventPage;
