import CreateEventForm from "@/components/form/create-event-form";

const CreateEventPage = () => {
  return (
    <section className="py-8 px-4">
      <h1 className="text-center font-semibold">Create an Event</h1>

      <div id="create-event" className="mt-8">
        <CreateEventForm />
      </div>
    </section>
  );
};

export default CreateEventPage;
