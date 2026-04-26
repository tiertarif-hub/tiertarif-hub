import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Download, Copy, Mail, Search, Loader2, MessageSquare, UserPlus } from "lucide-react";
import { useState } from "react";

// Types
type Subscriber = { id: string; email: string; source_page: string | null; created_at: string; is_active: boolean };
type Lead = { id: string; name: string | null; email: string | null; subject: string | null; message: string | null; type: string | null; created_at: string; status: string | null };

async function fetchSubscribers() {
  const { data, error } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Subscriber[] || [];
}

async function fetchLeads() {
  // Wir filtern auf type='contact_form', falls wir die Tabelle auch für anderes nutzen
  const { data, error } = await supabase.from("leads").select("*").eq("type", "contact_form").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Lead[] || [];
}

export default function AdminLeads() {
  const { data: subscribers = [], isLoading: loadingSubs } = useQuery({ queryKey: ["subscribers"], queryFn: fetchSubscribers });
  const { data: leads = [], isLoading: loadingLeads } = useQuery({ queryKey: ["admin-leads"], queryFn: fetchLeads });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubscribers = subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredLeads = leads.filter(l => (l.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (l.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase()));

  const isLoading = loadingSubs || loadingLeads;

  function copyEmails(list: { email: string | null }[]) {
    const text = list.map((s) => s.email).filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: `${list.length} E-Mails kopiert` });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Leads & Anfragen</h2>
          <p className="text-muted-foreground">Verwalte Kontaktanfragen und Newsletter-Abonnenten</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Suchen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="leads" className="gap-2"><MessageSquare className="w-4 h-4"/> Anfragen ({leads.length})</TabsTrigger>
          <TabsTrigger value="subscribers" className="gap-2"><UserPlus className="w-4 h-4"/> Newsletter ({subscribers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-6 space-y-4">
            {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto"/> : (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Kontaktanfragen</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => copyEmails(filteredLeads as any)}><Copy className="w-4 h-4 mr-2"/> E-Mails kopieren</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Datum</TableHead><TableHead>Name</TableHead><TableHead>Betreff</TableHead><TableHead>Nachricht</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredLeads.map(lead => (
                                <TableRow key={lead.id}>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{lead.name}</div>
                                        <div className="text-xs text-muted-foreground">{lead.email}</div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{lead.subject}</Badge></TableCell>
                                    <TableCell className="max-w-md truncate" title={lead.message || ""}>{lead.message}</TableCell>
                                    <TableCell><Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>{lead.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                            {filteredLeads.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Keine Anfragen gefunden</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            )}
        </TabsContent>

        <TabsContent value="subscribers" className="mt-6 space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Newsletter Abonnenten</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => copyEmails(filteredSubscribers)}><Copy className="w-4 h-4 mr-2"/> Alle kopieren</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Datum</TableHead><TableHead>E-Mail</TableHead><TableHead>Quelle</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredSubscribers.map(sub => (
                                <TableRow key={sub.id}>
                                    <TableCell className="text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{sub.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{sub.source_page || "Direkt"}</TableCell>
                                    <TableCell>{sub.is_active ? <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200">Aktiv</Badge> : <Badge variant="outline">Inaktiv</Badge>}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}