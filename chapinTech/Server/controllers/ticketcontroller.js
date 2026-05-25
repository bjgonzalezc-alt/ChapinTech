
// ticket maker
tickets.map(ticket => (
  <CaseCard key={ticket.id} />
))


// ticket controller
export async function assignTicket(
  req,
  res
){

  const { ticketId, technicianId }
    = req.body;

  const deadline =
    new Date(
      Date.now() + 15 * 60 * 1000
    );

  await db.query(

    `
    UPDATE tickets
    SET
      status = ?,
      assigned_technician_id = ?,
      arrival_deadline = ?
    WHERE id = ?
    `,

    [
      "ON_THE_WAY",
      technicianId,
      deadline,
      ticketId
    ]

  );

  res.json({
    success:true
  });

}